import { useNavigate } from "react-router";
import { Button } from "../Components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../Components/ui/card";
import { Input } from "../Components/ui/input";
import { MapPin, Phone, Star, Search } from "lucide-react";

export function DoctorFinder() {
  const navigate = useNavigate();

  const doctors = [
    {
      id: 1,
      name: "Dr. Olumide Adeleke",
      specialty: "General Practitioner",
      address: "Ikeja, Lagos",
      phone: "+234 801 234 5678",
      rating: 4.8,
    },
    {
      id: 2,
      name: "Dr. Chioma Okoro",
      specialty: "Cardiologist",
      address: "Victoria Island, Lagos",
      phone: "+234 802 345 6789",
      rating: 4.9,
    },
    {
      id: 3,
      name: "Dr. Ibrahim Musa",
      specialty: "Internal Medicine",
      address: "Wuse, Abuja",
      phone: "+234 803 456 7890",
      rating: 4.7,
    },
  ];

  return (
    <div className="min-h-screen p-4 pb-24 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            ← Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            Find Doctors & Hospitals
          </h1>
          <div className="w-10" />
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Search Nearby Care</CardTitle>
            <CardDescription>
              Find certified medical professionals in your area
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Specialty, doctor name, or location..."
                />
              </div>
              <Button>Search</Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-700">
            Recommended for You
          </h2>
          {doctors.map((doctor) => (
            <Card key={doctor.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg">{doctor.name}</h3>
                    <p className="text-emerald-600 font-medium">
                      {doctor.specialty}
                    </p>
                    <div className="flex items-center text-sm text-gray-500 gap-1">
                      <MapPin className="h-4 w-4" />
                      {doctor.address}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 gap-1">
                      <Phone className="h-4 w-4" />
                      {doctor.phone}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-yellow-500 font-bold gap-1 mb-2">
                      <Star className="h-4 w-4 fill-yellow-500" />
                      {doctor.rating}
                    </div>
                    <Button variant="outline" size="sm">
                      Book Appt
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
