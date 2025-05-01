import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Shield, 
  Loader2, 
  Search, 
  Heart, 
  Eye, 
  AlertCircle, 
  Calendar,
  RefreshCw, 
  User,
  Clock,
  Ban,
  MessageSquare,
  Star
} from "lucide-react";
import { fetchAllMedicalInfo, fetchMedicalInfoById, generateEmergencyCardUrl, MedicalInfoRecord } from "@/services/adminService";
import { MedicalInfo } from "@/services/emergencyService";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getUserFeedback, CustomerFeedback } from "@/services/feedbackService";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const AdminPage = () => {
  const { user, isLoading, isAdmin } = useAuth();
  const [medicalRecords, setMedicalRecords] = useState<MedicalInfoRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<MedicalInfoRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<MedicalInfoRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [emergencyCardUrl, setEmergencyCardUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [feedbackData, setFeedbackData] = useState<CustomerFeedback[]>([]);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate("/auth");
        return;
      }
      
      if (!isAdmin) {
        navigate("/");
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this page.",
          variant: "destructive",
        });
        return;
      }
      
      loadMedicalRecords();
      loadFeedbackData();
    }
  }, [user, isLoading, isAdmin, navigate]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredRecords(medicalRecords);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = medicalRecords.filter((record) => {
        const fullName = record.user_details?.full_name?.toLowerCase() || "";
        const email = record.user_details?.email?.toLowerCase() || "";
        const allergies = record.info.allergies?.join(" ").toLowerCase() || "";
        const conditions = record.info.conditions?.join(" ").toLowerCase() || "";
        
        return (
          fullName.includes(query) ||
          email.includes(query) ||
          allergies.includes(query) ||
          conditions.includes(query) ||
          record.info.bloodType?.toLowerCase().includes(query)
        );
      });
      setFilteredRecords(filtered);
    }
  }, [searchQuery, medicalRecords]);

  const loadMedicalRecords = async () => {
    setIsDataLoading(true);
    try {
      const records = await fetchAllMedicalInfo();
      setMedicalRecords(records);
      setFilteredRecords(records);
    } catch (error) {
      console.error("Error loading medical records:", error);
      toast({
        title: "Error",
        description: "Failed to load medical records.",
        variant: "destructive",
      });
    } finally {
      setIsDataLoading(false);
    }
  };

  const loadFeedbackData = async () => {
    if (!user) return;
    
    setIsFeedbackLoading(true);
    try {
      const { data, error } = await supabase
        .from('customer_feedback')
        .select('*')
        .order('timestamp', { ascending: false });
      
      if (error) {
        toast({
          title: "Error loading feedback",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      setFeedbackData(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading feedback",
        description: error.message || "Failed to load feedback data",
        variant: "destructive",
      });
    } finally {
      setIsFeedbackLoading(false);
    }
  };

  const handleViewDetails = (record: MedicalInfoRecord) => {
    setSelectedRecord(record);
    if (record.info) {
      setEmergencyCardUrl(generateEmergencyCardUrl(record.info));
    }
    setShowDetails(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const renderEmergencyContacts = (contacts: Array<{name: string, relationship: string, phone: string}> | undefined) => {
    if (!contacts || contacts.length === 0) {
      return <p className="text-gray-500 italic">No emergency contacts</p>;
    }

    return (
      <div className="space-y-2">
        {contacts.map((contact, index) => (
          <div key={index} className="p-2 border rounded">
            <p className="font-semibold">{contact.name}</p>
            <p className="text-sm text-gray-600">{contact.relationship}</p>
            <p className="text-sm text-blue-600">{contact.phone}</p>
          </div>
        ))}
      </div>
    );
  };

  const renderMedicalListItems = (items: string[] | undefined) => {
    if (!items || items.length === 0) {
      return <p className="text-gray-500 italic">None</p>;
    }

    return (
      <ul className="list-disc pl-5">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    );
  };

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[70vh]">
        <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Shield className="h-6 w-6 text-red-600 mr-2" />
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>
          <Button 
            onClick={loadMedicalRecords}
            variant="outline"
            className="flex items-center"
            disabled={isDataLoading}
          >
            {isDataLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
        
        <Tabs defaultValue="medical" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="medical">Medical Records</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
          </TabsList>
          <TabsContent value="medical">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Emergency Medical Information Records</CardTitle>
            <CardDescription>
              View and manage all user medical information. This data is confidential.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-4">
              <Search className="h-4 w-4 mr-2 text-gray-500" />
              <Input
                placeholder="Search by name, email, blood type, allergies or conditions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
            </div>
            
            {isDataLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="text-center py-10">
                <Heart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No medical records found.</p>
              </div>
            ) : (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Blood Type</TableHead>
                      <TableHead>Allergies</TableHead>
                      <TableHead>Medical Conditions</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={record.user_details?.avatar_url || ""}
                                alt={record.user_details?.full_name || ""}
                              />
                              <AvatarFallback>
                                {record.user_details?.full_name
                                  ? record.user_details.full_name.substring(0, 2).toUpperCase()
                                  : "UN"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{record.user_details?.full_name || "Unknown User"}</p>
                              <p className="text-xs text-gray-500">{record.user_details?.email || ""}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {record.info.bloodType || "Unknown"}
                        </TableCell>
                        <TableCell>
                          {record.info.allergies && record.info.allergies.length > 0
                            ? record.info.allergies.slice(0, 2).join(", ") + 
                              (record.info.allergies.length > 2 ? "..." : "")
                            : "None"}
                        </TableCell>
                        <TableCell>
                          {record.info.conditions && record.info.conditions.length > 0
                            ? record.info.conditions.slice(0, 2).join(", ") + 
                              (record.info.conditions.length > 2 ? "..." : "")
                            : "None"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1 text-gray-500" />
                            <span className="text-sm">{formatDate(record.updated_at)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewDetails(record)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
          <CardFooter className="text-sm text-gray-500 flex items-center">
            <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
            Medical information should only be accessed for emergency purposes. All access is logged.
          </CardFooter>
        </Card>
          </TabsContent>
          <TabsContent value="users">
            {/* Users tab content */}
          </TabsContent>
          <TabsContent value="feedback">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Customer Feedback</CardTitle>
                <CardDescription>
                  View and manage customer feedback submissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isFeedbackLoading ? (
                  <div className="flex justify-center my-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : feedbackData.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No feedback submissions yet</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Rating</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Details</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {feedbackData.map((feedback) => (
                            <TableRow key={feedback.id}>
                              <TableCell className="font-medium">
                                {new Date(feedback.timestamp).toLocaleString()}
                              </TableCell>
                              <TableCell className="capitalize">{feedback.feedback_type}</TableCell>
                              <TableCell>
                                <div className="flex">
                                  {Array.from({ length: feedback.rating }).map((_, i) => (
                                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell>{feedback.name || "Anonymous"}</TableCell>
                              <TableCell>{feedback.email || "-"}</TableCell>
                              <TableCell className="max-w-xs truncate">{feedback.details || "-"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="text-sm text-muted-foreground text-right">
                      {feedbackData.length} feedback submissions
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button 
                  variant="outline" 
                  onClick={loadFeedbackData}
                  className="ml-auto"
                  disabled={isFeedbackLoading}
                >
                  {isFeedbackLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
      
      {/* Medical Record Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Medical Information Details</DialogTitle>
            <DialogDescription>
              Complete medical information for {selectedRecord?.user_details?.full_name || "User"}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRecord && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={selectedRecord.user_details?.avatar_url || ""}
                      alt={selectedRecord.user_details?.full_name || ""}
                    />
                    <AvatarFallback>
                      {selectedRecord.user_details?.full_name
                        ? selectedRecord.user_details.full_name.substring(0, 2).toUpperCase()
                        : "UN"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">{selectedRecord.user_details?.full_name || "Unknown User"}</h3>
                    <p className="text-sm text-gray-500">{selectedRecord.user_details?.email || ""}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-500 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Last updated: {formatDate(selectedRecord.updated_at)}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Full Name</p>
                        <p>{selectedRecord.info.fullName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Blood Type</p>
                        <p className="font-semibold text-red-600">{selectedRecord.info.bloodType || "Unknown"}</p>
                      </div>
                      {selectedRecord.info.notes && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Additional Notes</p>
                          <p className="text-sm">{selectedRecord.info.notes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Medical Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Allergies</p>
                        {renderMedicalListItems(selectedRecord.info.allergies)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Medications</p>
                        {renderMedicalListItems(selectedRecord.info.medications)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Medical Conditions</p>
                        {renderMedicalListItems(selectedRecord.info.conditions)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Emergency Contacts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderEmergencyContacts(selectedRecord.info.emergencyContacts)}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Emergency Card</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center">
                    {emergencyCardUrl ? (
                      <div className="flex flex-col items-center">
                        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm max-w-xs mb-4">
                          <div className="text-center mb-2">
                            <h3 className="font-bold text-sm text-red-700">EMERGENCY MEDICAL INFORMATION</h3>
                            <p className="text-gray-700 font-semibold text-sm">{selectedRecord.info.fullName}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
                            <div>
                              <h4 className="font-bold text-gray-700">Blood Type</h4>
                              <p className="text-red-600 font-bold">{selectedRecord.info.bloodType}</p>
                            </div>
                            
                            {selectedRecord.info.allergies && selectedRecord.info.allergies.length > 0 && (
                              <div>
                                <h4 className="font-bold text-gray-700">Allergies</h4>
                                <p>{selectedRecord.info.allergies.join(', ')}</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex justify-center mb-2">
                            <img src={emergencyCardUrl} alt="Emergency QR Code" className="w-28 h-28" />
                          </div>
                          
                          <div className="text-center text-xs">
                            <p className="font-bold text-gray-800">SCAN FOR COMPLETE MEDICAL INFO</p>
                            <p className="text-red-700">In case of emergency, call 108</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center p-6">
                        <Ban className="h-10 w-10 text-gray-300 mr-2" />
                        <p className="text-gray-500">Emergency card not available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetails(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPage; 