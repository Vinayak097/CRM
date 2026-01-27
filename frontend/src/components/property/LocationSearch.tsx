import React, { useState, useEffect, useRef } from "react";
import { Search, Loader2 } from "lucide-react";
import { locationService } from "../../services/locationService";
import { Input } from "../ui/input";

interface LocationSearchProps {
  value: string;
  onSelect: (locationId: string, locationName: string) => void;
  placeholder?: string;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({
  value,
  onSelect,
  placeholder = "Search location..."
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedName, setSelectedName] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // When value changes from outside (e.g. on edit page load)
  useEffect(() => {
    const fetchLocationName = async () => {
      if (value && !selectedName) {
        try {
          const response = await locationService.getById(value);
          const loc = response.data;
          if (loc) {
            setSelectedName(loc.display_name);
            setQuery(loc.display_name);
          }
        } catch (err) {
          console.error("Failed to fetch location name", err);
        }
      } else if (!value) {
        setSelectedName("");
        setQuery("");
      }
    };
    fetchLocationName();
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = async (q: string) => {
    setQuery(q);
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    setIsOpen(true);
    try {
      const response = await locationService.searchLocations(q);
      setResults(response.data?.cities || []);
    } catch (err) {
      console.error("Location search failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (loc: any) => {
    setSelectedName(loc.display_name);
    setQuery(loc.display_name);
    setIsOpen(false);
    onSelect(loc.location_id, loc.display_name);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative">
        <Input
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder={placeholder}
          className="bg-gray-800 border-gray-700 pl-10"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </div>
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-gray-900 border border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
          {results.map((loc) => (
            <div
              key={loc.location_id}
              className="px-4 py-2 hover:bg-gray-800 cursor-pointer text-sm text-white transition-colors"
              onClick={() => handleSelect(loc)}
            >
              <div className="font-medium">{loc.city}</div>
              <div className="text-xs text-gray-400">{loc.display_name}</div>
            </div>
          ))}
        </div>
      )}

      {isOpen && !loading && query.length >= 2 && results.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-gray-900 border border-gray-700 rounded-md p-4 text-sm text-gray-400">
          No locations found for "{query}"
        </div>
      )}
    </div>
  );
};
