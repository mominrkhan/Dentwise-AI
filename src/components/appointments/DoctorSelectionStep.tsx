import { useAvailableDoctors } from "@/hooks/use-doctors";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import Image from "next/image";
import { CalendarClockIcon, MapPinIcon, PhoneIcon, SparklesIcon, StarIcon } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { DoctorCardsLoading } from "./DoctorCardsLoading";
import { useState } from "react";
import { Input } from "../ui/input";

// Fallback avatar component with initials
function AvatarFallback({ name }: { name: string }) {
  // Remove quotes first
  const cleanName = name.replace(/^["']|["']$/g, '').trim();
  const words = cleanName.split(/\s+/);
  
  const meaningfulWords = words.filter(word => 
    !['dental', 'dr', 'dr.', 'dentist', 'care', 'center', 'clinic', 'office', '-', '|', ''].includes(word.toLowerCase())
  );
  
  let initials = "";
  if (meaningfulWords.length === 0) {
    initials = words[0]?.substring(0, 2).toUpperCase() || "DC";
  } else if (meaningfulWords.length === 1) {
    initials = meaningfulWords[0].substring(0, 2).toUpperCase();
  } else {
    initials = meaningfulWords.slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  const gradients = [
    { from: "from-indigo-600", to: "to-indigo-400", shadow: "shadow-indigo-500/50" },
    { from: "from-violet-600", to: "to-purple-400", shadow: "shadow-violet-500/50" },
    { from: "from-cyan-600", to: "to-blue-400", shadow: "shadow-cyan-500/50" },
    { from: "from-emerald-600", to: "to-green-400", shadow: "shadow-emerald-500/50" },
    { from: "from-rose-600", to: "to-pink-400", shadow: "shadow-rose-500/50" },
    { from: "from-orange-600", to: "to-amber-400", shadow: "shadow-orange-500/50" },
    { from: "from-blue-600", to: "to-sky-400", shadow: "shadow-blue-500/50" },
    { from: "from-pink-600", to: "to-rose-400", shadow: "shadow-pink-500/50" },
  ];
  
  const colorIndex = cleanName.charCodeAt(0) % gradients.length;
  const gradient = gradients[colorIndex];
  
  return (
    <div className="relative">
      {/* Glow effect */}
      <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${gradient.from} ${gradient.to} blur-md opacity-40`} />
      
      {/* Main avatar */}
      <div className={`relative w-16 h-16 rounded-full bg-gradient-to-br ${gradient.from} ${gradient.to} flex items-center justify-center ring-4 ring-background shadow-xl ${gradient.shadow}`}>
        {/* Shine overlay */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 via-transparent to-transparent" />
        <span className="relative text-white text-xl font-black tracking-tight drop-shadow-lg">{initials}</span>
      </div>
    </div>
  );
}

interface DoctorSelectionStepProps {
  selectedDentistId: string | null;
  onSelectDentist: (dentistId: string) => void;
  onContinue: () => void;
}

function DoctorSelectionStep({
  onContinue,
  onSelectDentist,
  selectedDentistId,
}: DoctorSelectionStepProps) {
  const { data: dentists = [], isLoading } = useAvailableDoctors();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArea, setSelectedArea] = useState<string | null>(null);

  // Get unique areas - extract main borough names
  const areas = Array.from(
    new Set(
      dentists
        .map((d) => {
          if (!d.area) return null;
          const areaLower = d.area.toLowerCase();
          
          // Extract main borough from area string
          if (areaLower.includes('bronx')) return 'Bronx';
          if (areaLower.includes('brooklyn')) return 'Brooklyn';
          if (areaLower.includes('manhattan')) return 'Manhattan';
          if (areaLower.includes('queens')) return 'Queens';
          
          return null;
        })
        .filter(Boolean)
    )
  ).sort();

  // Filter dentists based on search and area
  const filteredDentists = dentists.filter((dentist) => {
    const matchesSearch =
      dentist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dentist.speciality.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dentist.area?.toLowerCase().includes(searchQuery.toLowerCase());

    // Match by borough name contained in area string
    const matchesArea = !selectedArea || 
      dentist.area?.toLowerCase().includes(selectedArea.toLowerCase());

    return matchesSearch && matchesArea;
  });

  if (isLoading)
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Choose Your Dentist</h2>
        <DoctorCardsLoading />
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Choose Your Dentist</h2>
            <p className="text-muted-foreground mt-1">
              {filteredDentists.length} dentist{filteredDentists.length !== 1 ? "s" : ""} available
            </p>
          </div>
          <Badge variant="secondary" className="gap-1.5">
            <SparklesIcon className="w-3.5 h-3.5" />
            Real availability
          </Badge>
        </div>

        {/* Search Bar */}
        <Input
          type="text"
          placeholder="Search by name, specialty, or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />

        {/* Area Filter Pills */}
        {areas.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedArea === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedArea(null)}
            >
              All Areas
            </Button>
            {areas.slice(0, 8).map((area) => (
              <Button
                key={area}
                variant={selectedArea === area ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedArea(area)}
              >
                {area}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Doctor Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDentists.map((dentist) => (
          <Card
            key={dentist.id}
            className={`cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 ${
              selectedDentistId === dentist.id
                ? "ring-2 ring-primary shadow-lg shadow-primary/20"
                : ""
            }`}
            onClick={() => onSelectDentist(dentist.id)}
          >
            <CardHeader className="pb-4">
              <div className="flex items-start gap-3">
                <div className="relative group shrink-0">
                  {/* Animated glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10 rounded-full blur-xl group-hover:blur-2xl group-hover:scale-110 transition-all duration-300 opacity-70" />
                  
                  {/* Avatar with initials */}
                  <div className="relative group-hover:scale-105 transition-transform duration-200">
                    <AvatarFallback name={dentist.name} />
                  </div>
                  
                  {/* Availability indicator */}
                  {dentist.nextAvailable && dentist.nextAvailable !== "No slots available" && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 bg-gradient-to-br from-emerald-400 via-green-400 to-teal-500 rounded-full border-3 border-background flex items-center justify-center shadow-lg">
                      <span className="w-2.5 h-2.5 bg-white rounded-full animate-pulse shadow-sm" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <CardTitle className="text-base leading-snug line-clamp-2 mb-1">
                    {dentist.name.replace(/^["']|["']$/g, '')}
                  </CardTitle>
                  <CardDescription className="text-primary font-medium text-xs mb-2 truncate">
                    {dentist.speciality || "General Dentistry"}
                  </CardDescription>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-full">
                      <StarIcon className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">4.9</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {dentist.appointmentCount}+ patients
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Location */}
              {dentist.area && (
                <div className="flex items-start gap-2.5 text-sm">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <MapPinIcon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <p className="font-semibold text-foreground text-sm line-clamp-1">
                      {dentist.area.replace(/^["']|["']$/g, '')}
                    </p>
                    {dentist.address && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {dentist.address.replace(/^["']|["']$/g, '')}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Phone */}
              <div className="flex items-center gap-2.5 text-sm">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <PhoneIcon className="w-4 h-4 text-primary" />
                </div>
                <span className="font-medium text-foreground truncate">{dentist.phone}</span>
              </div>

              {/* Next Available - Highlighted */}
              {dentist.nextAvailable && (
                <div
                  className={`flex items-center gap-2 text-sm p-2.5 rounded-lg ${
                    dentist.nextAvailable === "No slots available"
                      ? "bg-muted/50"
                      : "bg-primary/10 border border-primary/20"
                  }`}
                >
                  <CalendarClockIcon
                    className={`w-4 h-4 shrink-0 ${
                      dentist.nextAvailable === "No slots available"
                        ? "text-muted-foreground"
                        : "text-primary"
                    }`}
                  />
                  <span
                    className={`font-medium ${
                      dentist.nextAvailable === "No slots available"
                        ? "text-muted-foreground"
                        : "text-primary"
                    }`}
                  >
                    {dentist.nextAvailable === "No slots available"
                      ? "Fully booked"
                      : `Next: ${dentist.nextAvailable}`}
                  </span>
                </div>
              )}

              {/* Bio */}
              <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {(dentist.bio || "Experienced dental professional providing quality care.").replace(/^["']|["']$/g, '')}
                </p>
              </div>

              {/* Specialty Badges */}
              <div className="flex gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs font-medium shadow-sm">
                  ✓ Licensed Professional
                </Badge>
                {dentist.speciality !== "General Dentistry" && (
                  <Badge className="text-xs font-medium bg-primary/10 text-primary border-primary/20 shadow-sm">
                    ⭐ Specialist
                  </Badge>
                )}
              </div>

              {/* Selected Indicator */}
              {selectedDentistId === dentist.id && (
                <div className="pt-2 border-t border-border">
                  <p className="text-sm text-primary font-medium flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    Selected
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredDentists.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No dentists found matching your criteria.</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => {
            setSearchQuery("");
            setSelectedArea(null);
          }}>
            Clear Filters
          </Button>
        </div>
      )}

      {/* Continue Button */}
      {selectedDentistId && (
        <div className="flex justify-end sticky bottom-0 bg-background/95 backdrop-blur-sm py-4 border-t">
          <Button size="lg" onClick={onContinue} className="shadow-lg">
            Continue to Time Selection
            <CalendarClockIcon className="ml-2 w-5 h-5" />
          </Button>
        </div>
      )}
    </div>
  );
}
export default DoctorSelectionStep;
