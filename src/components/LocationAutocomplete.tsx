import { MapPin, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

type LocationAutocompleteProps = {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
};

type PlaceSuggestion = {
  id: string;
  label: string;
  source: "google" | "local";
};

const fallbackLocations = [
  "Andheri West, Mumbai, Maharashtra",
  "Bandra East, Mumbai, Maharashtra",
  "Dadar, Mumbai, Maharashtra",
  "Koramangala, Bengaluru, Karnataka",
  "Indiranagar, Bengaluru, Karnataka",
  "Whitefield, Bengaluru, Karnataka",
  "Gomti Nagar, Lucknow, Uttar Pradesh",
  "Hazratganj, Lucknow, Uttar Pradesh",
  "Sector 21, Gurugram, Haryana",
  "Lajpat Nagar, Delhi",
  "Rohini, Delhi",
  "Salt Lake, Kolkata, West Bengal",
];

let googleMapsPromise: Promise<boolean> | null = null;

export function LocationAutocomplete({
  name,
  defaultValue = "",
  placeholder = "Search area, city",
  required,
}: LocationAutocompleteProps) {
  const [value, setValue] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const requestId = useRef(0);

  const localMatches = useMemo(() => getLocalMatches(value), [value]);

  useEffect(() => {
    const input = value.trim();
    const currentRequest = ++requestId.current;

    if (input.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    const timer = window.setTimeout(async () => {
      const googleSuggestions = await getGooglePlacePredictions(input);
      if (currentRequest !== requestId.current) return;
      const nextSuggestions = googleSuggestions.length ? googleSuggestions : localMatches;
      setSuggestions(nextSuggestions);
      setOpen(nextSuggestions.length > 0);
      setLoading(false);
    }, 220);

    return () => window.clearTimeout(timer);
  }, [localMatches, value]);

  const selectSuggestion = (suggestion: PlaceSuggestion) => {
    setValue(suggestion.label);
    setOpen(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          name={name}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onFocus={() => setOpen(suggestions.length > 0)}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
          className="field pl-11"
        />
      </div>

      {loading && value.trim().length >= 2 && (
        <div
          className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 space-y-3 rounded-2xl border border-border bg-card p-4 shadow-2xl shadow-slate-900/10"
          aria-label="Loading locations"
          aria-busy="true"
        >
          {["first", "second", "third"].map((item) => (
            <div key={item} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
              <Skeleton className="h-4 flex-1 rounded-full" />
            </div>
          ))}
        </div>
      )}

      {!loading && open && (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-slate-900/10">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              type="button"
              onMouseDown={(event) => {
                event.preventDefault();
                selectSuggestion(suggestion);
              }}
              className="flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left last:border-b-0 hover:bg-muted"
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span className="text-sm font-semibold leading-5">{suggestion.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function getLocalMatches(input: string): PlaceSuggestion[] {
  const normalized = input.trim().toLowerCase();
  if (normalized.length < 2) return [];
  return fallbackLocations
    .filter((location) => location.toLowerCase().includes(normalized))
    .slice(0, 5)
    .map((label) => ({ id: `local-${label}`, label, source: "local" }));
}

async function getGooglePlacePredictions(input: string): Promise<PlaceSuggestion[]> {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!key) return [];

  const loaded = await loadGoogleMapsPlaces(key);
  if (!loaded) return [];

  const googleApi = getGoogleApi();
  const service = new googleApi.maps.places.AutocompleteService();

  return new Promise((resolve) => {
    service.getPlacePredictions(
      {
        input,
        componentRestrictions: { country: "in" },
      },
      (predictions: GooglePrediction[] | null, status: string) => {
        if (status !== googleApi.maps.places.PlacesServiceStatus.OK || !predictions) {
          resolve([]);
          return;
        }
        resolve(
          predictions.slice(0, 5).map((prediction) => ({
            id: prediction.place_id,
            label: prediction.description,
            source: "google",
          })),
        );
      },
    );
  }).catch(() => []);
}

function loadGoogleMapsPlaces(key: string) {
  const existing = getGoogleApi();
  if (existing?.maps?.places?.AutocompleteService) return Promise.resolve(true);
  if (googleMapsPromise) return googleMapsPromise;

  googleMapsPromise = new Promise((resolve) => {
    const callback = `angaGoogleMapsReady${Date.now()}`;
    const script = document.createElement("script");
    const cleanup = () => {
      delete (window as unknown as Record<string, unknown>)[callback];
    };

    (window as unknown as Record<string, () => void>)[callback] = () => {
      cleanup();
      resolve(true);
    };

    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places&callback=${callback}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      cleanup();
      resolve(false);
    };
    document.head.appendChild(script);
  });

  return googleMapsPromise;
}

function getGoogleApi() {
  return (window as unknown as { google?: GoogleMapsApi }).google;
}

type GoogleMapsApi = {
  maps: {
    places: {
      AutocompleteService: new () => {
        getPlacePredictions: (
          request: {
            input: string;
            componentRestrictions?: { country: string };
          },
          callback: (predictions: GooglePrediction[] | null, status: string) => void,
        ) => void;
      };
      PlacesServiceStatus: {
        OK: string;
      };
    };
  };
};

type GooglePrediction = {
  description: string;
  place_id: string;
};
