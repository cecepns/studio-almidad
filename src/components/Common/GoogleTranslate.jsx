import { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Globe } from "lucide-react";

const GoogleTranslate = ({ closeOnComplete = true, onComplete, variant = "default" } = {}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("id");
  const pendingLanguageRef = useRef(null);
  const isTranslatingRef = useRef(false);
  const waitTimerRef = useRef(null);

  const normalizeLang = useCallback((code) => {
    if (!code) return "id";
    const lower = String(code).toLowerCase();
    // Handle legacy Indonesian code 'in' → 'id'
    if (lower === "in") return "id";
    return lower;
  }, []);

  useEffect(() => {
    // Check if Google Translate is loaded and the gadget select exists
    const checkGoogleTranslate = () => {
      const isGoogleReady = Boolean(window.google && window.google.translate);
      if (isGoogleReady) {
        setIsLoaded(true);
      } else {
        setTimeout(checkGoogleTranslate, 100);
      }
    };

    checkGoogleTranslate();
  }, []);

  const getLanguageFromCookie = useCallback(() => {
    const match = document.cookie.match(/googtrans=\/[a-zA-Z-]+\/([a-zA-Z-]+)/);
    const raw = match?.[1] || "id"; // fallback ke "id"
    return normalizeLang(raw);
  }, [normalizeLang]);

  // Persist preferred language explicitly and ensure cookie is written with proper scope
  const setPreferredLanguage = useCallback((languageCode) => {
    try {
      window.localStorage.setItem("preferredLanguage", normalizeLang(languageCode));
    } catch {
      // ignore storage failures
    }
  }, [normalizeLang]);

  const getPreferredLanguage = useCallback(() => {
    try {
      const stored = window.localStorage.getItem("preferredLanguage");
      return stored ? normalizeLang(stored) : null;
    } catch {
      return null;
    }
  }, [normalizeLang]);

  const setGoogTransCookie = useCallback((targetCode) => {
    const pageLang = "id"; // keep in sync with index.html TranslateElement pageLanguage
    const value = `/${pageLang}/${normalizeLang(targetCode)}`;
    const isHttps = window.location.protocol === "https:";
    const base = `googtrans=${value}; path=/; max-age=${60 * 60 * 24 * 365 * 2}`; // ~2 years
    const secure = isHttps ? "; Secure; SameSite=Lax" : "; SameSite=Lax";
    const host = window.location.hostname;
    // Write cookie for exact host
    document.cookie = `${base}${secure}`;
    // And also with domain=.{host} to help across subdomains if any
    document.cookie = `${base}; domain=.${host}${secure}`;
  }, [normalizeLang]);

  const waitForCookieToMatch = useCallback((targetCode, { timeoutMs = 6000, intervalMs = 150 } = {}) => {
    return new Promise((resolve) => {
      const start = Date.now();
      const check = () => {
        const current = getLanguageFromCookie();
        if (current === normalizeLang(targetCode)) {
          resolve(true);
          return;
        }
        if (Date.now() - start >= timeoutMs) {
          resolve(false);
          return;
        }
        waitTimerRef.current = window.setTimeout(check, intervalMs);
      };
      check();
    });
  }, [getLanguageFromCookie, normalizeLang]);

  useEffect(() => {
    // Seed selectedLanguage from cookie or localStorage (preference wins)
    const cookieLang = getLanguageFromCookie();
    const stored = getPreferredLanguage();
    const initial = normalizeLang(stored || cookieLang || "id");
    setSelectedLanguage(initial);
    // If stored preference differs from cookie, align cookie and schedule translation
    if (stored && stored !== cookieLang) {
      setGoogTransCookie(stored);
      pendingLanguageRef.current = stored;
    }
  }, [getLanguageFromCookie, getPreferredLanguage, normalizeLang, setGoogTransCookie]);

  // Keep selectedLanguage in sync when Google updates the hidden select
  useEffect(() => {
    if (!isLoaded) return;
    const selectElement = document.querySelector(".goog-te-combo");
    if (!selectElement) return;
    const onChange = () => {
      const value = selectElement.value || getLanguageFromCookie() || "id";
      setSelectedLanguage(value);
    };
    selectElement.addEventListener("change", onChange);
    return () => {
      selectElement.removeEventListener("change", onChange);
    };
  }, [isLoaded, getLanguageFromCookie]);

  // // Sync selectedLanguage from localStorage or select after load, and listen to changes
  // useEffect(() => {
  //   if (!isLoaded) return;

  //   const seedFromState = () => {
  //     try {
  //       const stored = window.localStorage.getItem("preferredLanguage");
  //       if (stored) {
  //         setSelectedLanguage(stored);
  //         return;
  //       }
  //     } catch {
  //       // no-op: localStorage unavailable
  //     }
  //     const selectElement = document.querySelector(".goog-te-combo");
  //     if (selectElement && selectElement.value) {
  //       setSelectedLanguage(selectElement.value);
  //     }
  //   };

  //   // Observe insertion of the select and attach change listener
  //   const attachListener = () => {
  //     const selectElement = document.querySelector(".goog-te-combo");
  //     if (!selectElement) return false;
  //     const onChange = () => {
  //       const value = selectElement.value || "en";
  //       setSelectedLanguage(value);
  //       try {
  //         window.localStorage.setItem("preferredLanguage", value);
  //       } catch {
  //         // no-op: localStorage write failed
  //       }
  //     };
  //     selectElement.addEventListener("change", onChange);
  //     selectListenerRef.current = onChange;
  //     return true;
  //   };

  //   seedFromState();
  //   if (!attachListener()) {
  //     const observer = new MutationObserver(() => {
  //       if (attachListener()) {
  //         observer.disconnect();
  //       }
  //     });
  //     observer.observe(document.body, { childList: true, subtree: true });
  //     return () => observer.disconnect();
  //   }

  //   return () => {
  //     const selectElement = document.querySelector(".goog-te-combo");
  //     if (selectElement && selectListenerRef.current) {
  //       selectElement.removeEventListener("change", selectListenerRef.current);
  //     }
  //   };
  // }, [isLoaded]);

  // Removed heavy force/dispatch helpers to prevent loops and lag

  const handleLanguageChange = useCallback(async (languageCode) => {
    const targetCode = normalizeLang(languageCode);
    const select = document.querySelector(".goog-te-combo");
    if (!select) {
      // Defer until select appears
      pendingLanguageRef.current = targetCode;
      return;
    }

    // If a translation is already in progress, queue the latest request
    if (isTranslatingRef.current) {
      pendingLanguageRef.current = targetCode;
      return;
    }

    isTranslatingRef.current = true;
    setIsTranslating(true);

    // Persist intention immediately (cookie will be set only if needed)
    setPreferredLanguage(targetCode);

    // Attempt translating with small retries; if cookie doesn't settle, set it then retry
    let success = false;
    const maxAttempts = 2;
    let cookieForced = false;
    for (let attempt = 0; attempt < maxAttempts && !success; attempt += 1) {
      // If another request arrived during attempts, break to let queue run later
      if (pendingLanguageRef.current && pendingLanguageRef.current !== targetCode) {
        break;
      }
      // Trigger Google Translate
      select.value = targetCode;
      select.dispatchEvent(new Event("change"));
      // Optimistic UI
      setSelectedLanguage(targetCode);
      success = await waitForCookieToMatch(targetCode);
      if (!success) {
        // If after first try cookie still not updated, force cookie then try again next loop
        if (!cookieForced) {
          setGoogTransCookie(targetCode);
          cookieForced = true;
        }
        await new Promise((r) => setTimeout(r, 200));
      }
    }

    let finalCodeVar = null;
    try {
      if (!success) {
        // Final wait one more time in case it settled late
        setGoogTransCookie(targetCode);
        // Nudge translate one last time
        select.value = targetCode;
        select.dispatchEvent(new Event("change"));
        await waitForCookieToMatch(targetCode);
      }
      // Sync UI to final cookie value to avoid drift
      const finalCode = getLanguageFromCookie();
      if (finalCode) {
        setSelectedLanguage(finalCode);
      }
      finalCodeVar = finalCode;
    } finally {
      // Clear any pending poll timer
      if (waitTimerRef.current) {
        clearTimeout(waitTimerRef.current);
        waitTimerRef.current = null;
      }
      // Mark as idle
      isTranslatingRef.current = false;
      setIsTranslating(false);
      if (closeOnComplete) {
        setIsOpen(false);
      }
      if (typeof onComplete === "function") {
        onComplete(finalCodeVar);
      }

      // If another language was requested meanwhile, process it now
      if (pendingLanguageRef.current && pendingLanguageRef.current !== targetCode) {
        const next = pendingLanguageRef.current;
        pendingLanguageRef.current = null;
        // Call recursively but without creating overlapping flows
        handleLanguageChange(next);
      } else {
        pendingLanguageRef.current = null;
      }
    }
  }, [waitForCookieToMatch, getLanguageFromCookie, normalizeLang, setPreferredLanguage, setGoogTransCookie, closeOnComplete, onComplete]);

  // If the select isn't present initially, observe DOM until it appears then flush pending
  useEffect(() => {
    if (!isLoaded) return;
    const tryFlush = () => {
      const select = document.querySelector(".goog-te-combo");
      if (select && pendingLanguageRef.current && !isTranslatingRef.current) {
        const next = pendingLanguageRef.current;
        pendingLanguageRef.current = null;
        handleLanguageChange(next);
        return true;
      }
      return false;
    };
    if (tryFlush()) return;
    const observer = new MutationObserver(() => {
      if (tryFlush()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [isLoaded, handleLanguageChange]);

  // Clear any pending timers on unmount
  useEffect(() => {
    return () => {
      if (waitTimerRef.current) {
        clearTimeout(waitTimerRef.current);
      }
    };
  }, []);

  const languages = [
    { code: "id", name: "Indonesia", flag: "🇮🇩" },
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "ja", name: "日本語", flag: "🇯🇵" },
    { code: "ar", name: "العربية", flag: "🇸🇦" },
  ];

  // Always render control so user can click; show subtle disabled state until ready

  return (
    <div className="relative notranslate" translate="no">
      {/* google_translate_element is now mounted in index.html for stable initialization */}

      {/* Custom Language Selector */}
      <div className="relative notranslate" translate="no">
        <button
          onClick={() => isLoaded && !isTranslating && setIsOpen(!isOpen)}
          className={`flex items-center space-x-2 md:px-3 md:py-2 rounded-md text-sm font-medium transition-colors ${
            variant === "light"
              ? isLoaded && !isTranslating
                ? "text-white hover:text-primary-300"
                : "text-gray-400 cursor-not-allowed"
              : isLoaded && !isTranslating
                ? "text-gray-700"
                : "text-gray-400 cursor-not-allowed"
          }`}
          aria-disabled={!isLoaded || isTranslating}
        >
          <Globe className="h-4 w-4" />
          <span className="notranslate" translate="no">
            {languages.find((l) => l.code === selectedLanguage)?.flag || "🌐"}{" "}
            {languages.find((l) => l.code === selectedLanguage)?.name ||
              "Indonesia"}
          </span>
        </button>

        {isOpen && (
          <div
            className="absolute md:right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200 notranslate"
            translate="no"
          >
            <div className="py-1">
              {languages.map((language) => {
                const isSelected = language.code === selectedLanguage;
                return (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageChange(language.code)}
                    className={`flex items-center w-full px-4 py-2 text-sm transition-colors ${
                      isSelected
                        ? "bg-primary-600 text-white"
                        : "text-gray-700 hover:bg-primary-600 hover:text-white"
                    }`}
                    aria-selected={isSelected}
                    disabled={isTranslating}
                  >
                    <span className="mr-3 text-lg notranslate" translate="no">
                      {language.flag}
                    </span>
                    <span
                      className="flex-1 text-left notranslate"
                      translate="no"
                    >
                      {language.name}
                    </span>
                    {isSelected && <span className="ml-2">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
      {/* Optional minimal loading indicator */}
      {isTranslating && (
        <div className={`absolute -top-1 md:top-7 right-0 mt-1 text-xs select-none ${
          variant === "light" ? "text-gray-300" : "text-gray-500"
        }`}>
          Translating...
        </div>
      )}
    </div>
  );
};

export default GoogleTranslate;

GoogleTranslate.propTypes = {
  closeOnComplete: PropTypes.bool,
  onComplete: PropTypes.func,
  variant: PropTypes.oneOf(["default", "light"]),
};
