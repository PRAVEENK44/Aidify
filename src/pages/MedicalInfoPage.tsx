import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  AlertCircle, 
  Loader2, 
  Heart, 
  Plus, 
  Trash2, 
  Save, 
  Download,
  Share2,
  Printer,
  QrCode
} from "lucide-react";
import { storeMedicalInfo, getMedicalInfo, MedicalInfo } from "@/services/emergencyService";
import QRCode from 'qrcode';

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"];

interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

const MedicalInfoPage = () => {
  const { user, isLoading } = useAuth();
  const [medicalInfo, setMedicalInfo] = useState<MedicalInfo>({
    fullName: "",
    bloodType: "Unknown",
    allergies: [""],
    medications: [""],
    conditions: [""],
    emergencyContacts: [{
      name: "",
      relationship: "",
      phone: ""
    }],
    notes: ""
  });
  const [isSaving, setIsSaving] = useState(false);
  const [emergencyQR, setEmergencyQR] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("basic");
  const { toast } = useToast();
  const navigate = useNavigate();
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const qrCodeRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    } else if (user) {
      loadMedicalInfo();
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (medicalInfo.fullName && medicalInfo.bloodType) {
      generateQRCodeInBackground(medicalInfo);
    }
  }, [medicalInfo.fullName, medicalInfo.bloodType, medicalInfo.allergies, 
      medicalInfo.medications, medicalInfo.conditions, medicalInfo.emergencyContacts]);

  const loadMedicalInfo = async () => {
    if (!user) return;
    
    try {
      const info = await getMedicalInfo(user.id);
      if (info) {
        setMedicalInfo({
          ...info,
          allergies: info.allergies?.length ? info.allergies : [""],
          medications: info.medications?.length ? info.medications : [""],
          conditions: info.conditions?.length ? info.conditions : [""],
          emergencyContacts: info.emergencyContacts?.length ? info.emergencyContacts : [{
            name: "",
            relationship: "",
            phone: ""
          }]
        });
      } else {
        // Set default with user's name if available
        setMedicalInfo({
          ...medicalInfo,
          fullName: user.user_metadata?.full_name || ""
        });
      }
    } catch (error) {
      console.error("Error loading medical info:", error);
      toast({
        title: "Error",
        description: "Failed to load your medical information.",
        variant: "destructive",
      });
    }
  };

  const generateQRCodeInBackground = async (info: MedicalInfo) => {
    const qrData = {
      name: info.fullName,
      bloodType: info.bloodType,
      allergies: info.allergies,
      medications: info.medications,
      conditions: info.conditions,
      emergencyContacts: info.emergencyContacts?.map(c => ({
        name: c.name,
        phone: c.phone
      }))
    };
    
    try {
      const qrCodeText = JSON.stringify(qrData);
      
      const dataUrl = await QRCode.toDataURL(qrCodeText, {
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 200,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      
      qrCodeRef.current = dataUrl;
      setQrCodeData(dataUrl);
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  const handleSaveMedicalInfo = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      // Clean up empty entries
      const cleanedInfo = {
        ...medicalInfo,
        allergies: medicalInfo.allergies?.filter(item => item.trim() !== "") || [],
        medications: medicalInfo.medications?.filter(item => item.trim() !== "") || [],
        conditions: medicalInfo.conditions?.filter(item => item.trim() !== "") || [],
        emergencyContacts: medicalInfo.emergencyContacts?.filter(contact => 
          contact.name.trim() !== "" || contact.phone.trim() !== ""
        ) || []
      };
      
      await storeMedicalInfo(user.id, cleanedInfo);
      
      if (qrCodeRef.current) {
        setEmergencyQR(qrCodeRef.current);
      } else {
        const qrData = {
          name: medicalInfo.fullName,
          bloodType: medicalInfo.bloodType,
          allergies: medicalInfo.allergies,
          medications: medicalInfo.medications,
          conditions: medicalInfo.conditions,
          emergencyContacts: medicalInfo.emergencyContacts?.map(c => ({
            name: c.name,
            phone: c.phone
          }))
        };
        
        const qrCodeText = encodeURIComponent(JSON.stringify(qrData));
        setEmergencyQR(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrCodeText}`);
      }
      
      toast({
        title: "Success",
        description: "Your medical information has been saved.",
      });
      setActiveTab("emergency-card");
    } catch (error) {
      console.error("Error saving medical info:", error);
      toast({
        title: "Error",
        description: "Failed to save your medical information.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddItem = (field: 'allergies' | 'medications' | 'conditions') => {
    setMedicalInfo({
      ...medicalInfo,
      [field]: [...(medicalInfo[field] || []), ""]
    });
  };

  const handleRemoveItem = (field: 'allergies' | 'medications' | 'conditions', index: number) => {
    setMedicalInfo({
      ...medicalInfo,
      [field]: (medicalInfo[field] || []).filter((_, i) => i !== index)
    });
  };

  const handleItemChange = (field: 'allergies' | 'medications' | 'conditions', index: number, value: string) => {
    const newArray = [...(medicalInfo[field] || [])];
    newArray[index] = value;
    setMedicalInfo({
      ...medicalInfo,
      [field]: newArray
    });
  };

  const handleAddContact = () => {
    setMedicalInfo({
      ...medicalInfo,
      emergencyContacts: [
        ...(medicalInfo.emergencyContacts || []),
        { name: "", relationship: "", phone: "" }
      ]
    });
  };

  const handleRemoveContact = (index: number) => {
    setMedicalInfo({
      ...medicalInfo,
      emergencyContacts: (medicalInfo.emergencyContacts || []).filter((_, i) => i !== index)
    });
  };

  const handleContactChange = (index: number, field: keyof EmergencyContact, value: string) => {
    const newContacts = [...(medicalInfo.emergencyContacts || [])];
    newContacts[index] = {
      ...newContacts[index],
      [field]: value
    };
    setMedicalInfo({
      ...medicalInfo,
      emergencyContacts: newContacts
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[70vh]">
        <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="container py-10 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
          Emergency Medical Information
        </h1>
        <Button 
          onClick={handleSaveMedicalInfo} 
          disabled={isSaving}
          className="bg-gradient-to-r from-aidify-blue to-aidify-green text-white"
        >
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Information
        </Button>
      </div>

      <div className="text-gray-600 mb-8">
        <p>
          This information will be stored securely and made available to emergency responders when needed.
          You can update it anytime.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="medical">Medical Details</TabsTrigger>
          <TabsTrigger value="contacts">Emergency Contacts</TabsTrigger>
          <TabsTrigger value="emergency-card">Emergency Card</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                This information helps identify you in an emergency
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={medicalInfo.fullName}
                  onChange={(e) => setMedicalInfo({ ...medicalInfo, fullName: e.target.value })}
                  placeholder="Your full name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bloodType">Blood Type</Label>
                <Select 
                  value={medicalInfo.bloodType || "Unknown"}
                  onValueChange={(value) => setMedicalInfo({ ...medicalInfo, bloodType: value })}
                >
                  <SelectTrigger id="bloodType">
                    <SelectValue placeholder="Select blood type" />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOOD_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={medicalInfo.notes || ""}
                  onChange={(e) => setMedicalInfo({ ...medicalInfo, notes: e.target.value })}
                  placeholder="Any other important information emergency responders should know"
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medical" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Allergies</CardTitle>
              <CardDescription>
                List any allergies you have, especially to medications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {medicalInfo.allergies?.map((allergy, index) => (
                <div key={`allergy-${index}`} className="flex gap-2">
                  <Input
                    value={allergy}
                    onChange={(e) => handleItemChange('allergies', index, e.target.value)}
                    placeholder="Allergy (e.g., Penicillin, Peanuts)"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemoveItem('allergies', index)}
                    className="shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddItem('allergies')}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Allergy
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Medications</CardTitle>
              <CardDescription>
                List medications you take regularly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {medicalInfo.medications?.map((medication, index) => (
                <div key={`medication-${index}`} className="flex gap-2">
                  <Input
                    value={medication}
                    onChange={(e) => handleItemChange('medications', index, e.target.value)}
                    placeholder="Medication (e.g., Insulin, Metformin)"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemoveItem('medications', index)}
                    className="shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddItem('medications')}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Medication
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Medical Conditions</CardTitle>
              <CardDescription>
                List any pre-existing medical conditions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {medicalInfo.conditions?.map((condition, index) => (
                <div key={`condition-${index}`} className="flex gap-2">
                  <Input
                    value={condition}
                    onChange={(e) => handleItemChange('conditions', index, e.target.value)}
                    placeholder="Condition (e.g., Diabetes, Asthma)"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemoveItem('conditions', index)}
                    className="shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddItem('conditions')}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Condition
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contacts</CardTitle>
              <CardDescription>
                People to contact in case of emergency
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {medicalInfo.emergencyContacts?.map((contact, index) => (
                <div key={`contact-${index}`} className="p-4 border border-gray-200 rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Contact #{index + 1}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveContact(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Remove
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`contact-name-${index}`}>Name</Label>
                      <Input
                        id={`contact-name-${index}`}
                        value={contact.name}
                        onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                        placeholder="Contact name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`contact-relationship-${index}`}>Relationship</Label>
                      <Input
                        id={`contact-relationship-${index}`}
                        value={contact.relationship}
                        onChange={(e) => handleContactChange(index, 'relationship', e.target.value)}
                        placeholder="E.g., Spouse, Parent, Friend"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`contact-phone-${index}`}>Phone Number</Label>
                    <Input
                      id={`contact-phone-${index}`}
                      type="tel"
                      value={contact.phone}
                      onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                      placeholder="Emergency contact phone number"
                    />
                  </div>
                </div>
              ))}
              
              <Button
                onClick={handleAddContact}
                variant="outline"
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Emergency Contact
              </Button>
            </CardContent>
            <CardFooter className="bg-amber-50 text-amber-800 text-sm p-4 rounded-b-lg border-t border-amber-100">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              These contacts will receive SMS notifications with your location if you use the emergency button.
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="emergency-card" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Medical Card</CardTitle>
              <CardDescription>
                Print this card or save it to your phone for emergency situations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {qrCodeData ? (
                <div className="flex flex-col items-center">
                  <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-md max-w-md mx-auto mb-6">
                    <div className="text-center mb-4">
                      <h3 className="font-bold text-lg text-red-700">EMERGENCY MEDICAL INFORMATION</h3>
                      <p className="text-gray-700 font-semibold">{medicalInfo.fullName}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="font-bold text-gray-700 text-sm">Blood Type</h4>
                        <p className="text-red-600 font-bold">{medicalInfo.bloodType}</p>
                      </div>
                      
                      {medicalInfo.allergies && medicalInfo.allergies.length > 0 && (
                        <div>
                          <h4 className="font-bold text-gray-700 text-sm">Allergies</h4>
                          <p className="text-sm">{medicalInfo.allergies.join(', ')}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-center mb-4">
                      <img src={qrCodeData} alt="Emergency QR Code" className="w-40 h-40" />
                    </div>
                    
                    <div className="text-center text-sm">
                      <p className="font-bold text-gray-800">SCAN FOR COMPLETE MEDICAL INFO</p>
                      <p className="text-red-700">In case of emergency, call 108</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Button variant="outline" onClick={handlePrint} className="gap-2">
                      <Printer className="h-4 w-4" />
                      Print Card
                    </Button>
                    <Button variant="outline" onClick={() => window.open(qrCodeData, '_blank')} className="gap-2">
                      <Download className="h-4 w-4" />
                      Save QR Code
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="flex justify-center mb-4">
                    <Heart className="h-16 w-16 text-gray-300" />
                  </div>
                  <p className="text-gray-500 mb-4">Save your medical information to generate an emergency card</p>
                  <Button onClick={handleSaveMedicalInfo} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <QrCode className="mr-2 h-4 w-4" />}
                    Generate Emergency Card
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MedicalInfoPage; 