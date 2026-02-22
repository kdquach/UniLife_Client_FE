const SOUND_PREF_KEY = "unilife:notification:sound-enabled";
const SOUND_PREF_EVENT = "unilife:notification:sound-preference-updated";

export function getNotificationSoundEnabled() {
  if (typeof window === "undefined") return true;
  const raw = window.localStorage.getItem(SOUND_PREF_KEY);
  if (raw === null) return true;
  return raw === "1";
}

export function setNotificationSoundEnabled(enabled) {
  if (typeof window === "undefined") return;
  const next = enabled ? "1" : "0";
  window.localStorage.setItem(SOUND_PREF_KEY, next);
  window.dispatchEvent(
    new CustomEvent(SOUND_PREF_EVENT, {
      detail: { enabled: enabled === true },
    }),
  );
}

export function subscribeNotificationSoundPreference(handler) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const onCustomUpdate = (event) => {
    const enabled = event?.detail?.enabled;
    if (typeof enabled === "boolean") {
      handler(enabled);
      return;
    }
    handler(getNotificationSoundEnabled());
  };

  const onStorage = (event) => {
    if (event.key !== SOUND_PREF_KEY) return;
    handler(getNotificationSoundEnabled());
  };

  window.addEventListener(SOUND_PREF_EVENT, onCustomUpdate);
  window.addEventListener("storage", onStorage);

  return () => {
    window.removeEventListener(SOUND_PREF_EVENT, onCustomUpdate);
    window.removeEventListener("storage", onStorage);
  };
}
