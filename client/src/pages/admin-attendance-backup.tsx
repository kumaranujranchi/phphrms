import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Clock, 
  Calendar as CalendarIcon, 
  MapPin, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Users,
  Filter,
  Download,
  TrendingUp
} from "lucide-react";
import { format, startOfMonth, endOfMonth, isToday, startOfDay, endOfDay } from "date-fns";
import { getLocationName } from "@/utils/geocoding";

interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
  location: string | null;
  locationName: string | null;
  latitude: string | null;
  longitude: string | null;
  reason: string | null;
  checkOutReason: string | null;
  isOutOfOffice: boolean;
  isOutOfOfficeCheckOut: boolean;
  distanceFromOffice: number | null;
  checkOutDistanceFromOffice: number | null;
  workingHours?: number;
}

interface AttendanceStats {
  totalEmployees: number;
  presentToday: number;
  lateToday: number;
  absentToday: number;
  averageWorkingHours: number;
}

export default function AdminAttendancePage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateRange, setDateRange] = useState({
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date())
  });
  const [activeTab, setActiveTab] = useState("today");

  // Redirect non-admin users
  useEffect(() => {
    if (!user) return;
    if (user.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "This page is only accessible to administrators.",
        variant: "destructive",
      });
      window.location.href = '/dashboard';
    }
  }, [user, toast]);

  // Today's attendance data
  const { data: todayAttendance, isLoading: loadingToday } = useQuery<AttendanceRecord[]>({
    queryKey: ["/api/admin/attendance/today"],
    retry: false,
    enabled: !!user && user.role === 'admin'
  });

  // Date range attendance data  
  const { data: rangeAttendance, isLoading: loadingRange } = useQuery<AttendanceRecord[]>({
    queryKey: ["/api/admin/attendance/range", dateRange.startDate.toISOString(), dateRange.endDate.toISOString()],
    retry: false,
    enabled: !!user && user.role === 'admin' && activeTab === "range"
  });

  // Attendance statistics
  const { data: attendanceStats, isLoading: loadingStats } = useQuery<AttendanceStats>({
    queryKey: ["/api/admin/attendance/stats"],
    retry: false,
    enabled: !!user && user.role === 'admin'
  });

  useEffect(() => {
    const checkError = async () => {
      try {
        // This will trigger error handling if unauthorized
      } catch (error) {
        if (isUnauthorizedError(error as Error)) {
          toast({
            title: "Unauthorized",
            description: "You are logged out. Logging in again...",
            variant: "destructive",
          });
          setTimeout(() => {
            window.location.href = "/api/login";
          }, 500);
          return;
        }
      }
    };
    checkError();
  }, [toast]);

  const getStatusBadge = (status: string, checkIn: string | null, checkOut: string | null, isOutOfOffice?: boolean, isOutOfOfficeCheckOut?: boolean) => {
    if (status === 'present' || status === 'out_of_office') {
      if (checkOut) {
        if (isOutOfOfficeCheckOut) {
          return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200"><MapPin className="h-3 w-3 mr-1" />Out of Office Checkout</Badge>;
        }
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200"><CheckCircle className="h-3 w-3 mr-1" />Complete</Badge>;
      } else if (checkIn) {
        if (isOutOfOffice) {
          return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200"><MapPin className="h-3 w-3 mr-1" />Out of Office</Badge>;
        }
        return <Badge className="bg-primary-100 text-primary-800 hover:bg-primary-200"><Clock className="h-3 w-3 mr-1" />Checked In</Badge>;
      }
    } else if (status === 'late') {
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200"><AlertCircle className="h-3 w-3 mr-1" />Late</Badge>;
    } else if (status === 'absent') {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-200"><XCircle className="h-3 w-3 mr-1" />Absent</Badge>;
    }
    return <Badge variant="secondary">Unknown</Badge>;
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return "N/A";
    return format(new Date(timeString), "hh:mm a");
  };

  const formatWorkingHours = (hours: number | undefined) => {
    if (!hours) return "N/A";
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  // Location Display Component
  const LocationDisplay = ({ record }: { record: AttendanceRecord }) => {
    const [locationName, setLocationName] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
      const fetchLocationName = async () => {
        // If locationName is already available, use it
        if (record.locationName) {
          setLocationName(record.locationName);
          return;
        }
        
        // If we have coordinates, reverse geocode them
        if (record.latitude && record.longitude) {
          setIsLoading(true);
          try {
            const lat = parseFloat(record.latitude);
            const lng = parseFloat(record.longitude);
            const name = await getLocationName(lat, lng);
            setLocationName(name);
          } catch (error) {
            console.error('Failed to get location name:', error);
            setLocationName(`${record.latitude}, ${record.longitude}`);
          } finally {
            setIsLoading(false);
          }
          return;
        }
        
        // If we have location string, use it
        if (record.location) {
          setLocationName(record.location);
          return;
        }
        
        // Fallback
        setLocationName("No location data");
      };

      fetchLocationName();
    }, [record]);

    if (isLoading) {
      return (
        <div className="flex items-center text-sm text-gray-500">
          <MapPin className="h-3 w-3 mr-1" />
          <span>Loading location...</span>
        </div>
      );
    }

    return (
      <div className="flex items-center text-sm">
        <MapPin className="h-3 w-3 mr-1 text-primary-500" />
        <span className="font-medium">{locationName}</span>
      </div>
    );
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Attendance Management
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Monitor and manage employee attendance across your organization
            </p>
          </div>
          <div className="flex items-center gap-4 mt-4 lg:mt-0">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-primary-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Employees</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {attendanceStats?.totalEmployees || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Present Today</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {attendanceStats?.presentToday || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Late Today</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {attendanceStats?.lateToday || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <XCircle className="h-8 w-8 text-red-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Absent Today</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {attendanceStats?.absentToday || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Working Hours</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {formatWorkingHours(attendanceStats?.averageWorkingHours)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Data Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Records</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="today">Today's Attendance</TabsTrigger>
                <TabsTrigger value="range">Date Range</TabsTrigger>
              </TabsList>
              
              <TabsContent value="today" className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Check In</TableHead>
                        <TableHead>Check Out</TableHead>
                        <TableHead>Working Hours</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Out of Office</TableHead>
                        <TableHead>Reasons</TableHead>
                        <TableHead>Coordinates</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loadingToday ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8">
                            Loading attendance data...
                          </TableCell>
                        </TableRow>
                      ) : todayAttendance && todayAttendance.length > 0 ? (
                        todayAttendance.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{record.userName}</p>
                                <p className="text-sm text-gray-500">{record.userEmail}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(record.status, record.checkIn, record.checkOut, record.isOutOfOffice, record.isOutOfOfficeCheckOut)}
                            </TableCell>
                            <TableCell>{formatTime(record.checkIn)}</TableCell>
                            <TableCell>{formatTime(record.checkOut)}</TableCell>
                            <TableCell>{formatWorkingHours(record.workingHours)}</TableCell>
                            <TableCell>
                              <LocationDisplay record={record} />
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                {record.isOutOfOffice && (
                                  <Badge variant="outline" className="text-xs bg-orange-50 text-orange-600 border-orange-200">
                                    Check-In Outside ({record.distanceFromOffice ? `${Math.round(record.distanceFromOffice)}m` : 'N/A'})
                                  </Badge>
                                )}
                                {record.isOutOfOfficeCheckOut && (
                                  <Badge variant="outline" className="text-xs bg-red-50 text-red-600 border-red-200">
                                    Check-Out Outside ({record.checkOutDistanceFromOffice ? `${Math.round(record.checkOutDistanceFromOffice)}m` : 'N/A'})
                                  </Badge>
                                )}
                                {!record.isOutOfOffice && !record.isOutOfOfficeCheckOut && (
                                  <span className="text-xs text-gray-400">—</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1 max-w-xs">
                                {record.reason && (
                                  <div className="text-xs p-2 bg-amber-50 rounded border border-amber-200">
                                    <div className="font-medium text-amber-800 mb-1">Check-In Reason:</div>
                                    <div className="text-amber-700">{record.reason}</div>
                                  </div>
                                )}
                                {record.checkOutReason && (
                                  <div className="text-xs p-2 bg-red-50 rounded border border-red-200">
                                    <div className="font-medium text-red-800 mb-1">Check-Out Reason:</div>
                                    <div className="text-red-700">{record.checkOutReason}</div>
                                  </div>
                                )}
                                {!record.reason && !record.checkOutReason && (
                                  <span className="text-xs text-gray-400">—</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {record.latitude && record.longitude ? (
                                <div className="text-xs text-gray-500 font-mono">
                                  <div>Lat: {parseFloat(record.latitude).toFixed(6)}</div>
                                  <div>Lng: {parseFloat(record.longitude).toFixed(6)}</div>
                                </div>
                              ) : record.location ? (
                                <div className="text-xs text-gray-500 font-mono">
                                  {record.location}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400">—</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                            No attendance records found for today
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="range" className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Date Range:</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          {format(dateRange.startDate, "MMM dd")} - {format(dateRange.endDate, "MMM dd, yyyy")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="range"
                          selected={{
                            from: dateRange.startDate,
                            to: dateRange.endDate
                          }}
                          onSelect={(range) => {
                            if (range?.from && range?.to) {
                              setDateRange({
                                startDate: startOfDay(range.from),
                                endDate: endOfDay(range.to)
                              });
                            }
                          }}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Employee</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Check In</TableHead>
                        <TableHead>Check Out</TableHead>
                        <TableHead>Working Hours</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Out of Office</TableHead>
                        <TableHead>Reasons</TableHead>
                        <TableHead>Coordinates</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loadingRange ? (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center py-8">
                            Loading attendance data...
                          </TableCell>
                        </TableRow>
                      ) : rangeAttendance && rangeAttendance.length > 0 ? (
                        rangeAttendance.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>{format(new Date(record.date), "MMM dd, yyyy")}</TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{record.userName}</p>
                                <p className="text-sm text-gray-500">{record.userEmail}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(record.status, record.checkIn, record.checkOut, record.isOutOfOffice, record.isOutOfOfficeCheckOut)}
                            </TableCell>
                            <TableCell>{formatTime(record.checkIn)}</TableCell>
                            <TableCell>{formatTime(record.checkOut)}</TableCell>
                            <TableCell>{formatWorkingHours(record.workingHours)}</TableCell>
                            <TableCell>
                              <LocationDisplay record={record} />
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                {record.isOutOfOffice && (
                                  <Badge variant="outline" className="text-xs bg-orange-50 text-orange-600 border-orange-200">
                                    Check-In Outside ({record.distanceFromOffice ? `${Math.round(record.distanceFromOffice)}m` : 'N/A'})
                                  </Badge>
                                )}
                                {record.isOutOfOfficeCheckOut && (
                                  <Badge variant="outline" className="text-xs bg-red-50 text-red-600 border-red-200">
                                    Check-Out Outside ({record.checkOutDistanceFromOffice ? `${Math.round(record.checkOutDistanceFromOffice)}m` : 'N/A'})
                                  </Badge>
                                )}
                                {!record.isOutOfOffice && !record.isOutOfOfficeCheckOut && (
                                  <span className="text-xs text-gray-400">—</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1 max-w-xs">
                                {record.reason && (
                                  <div className="text-xs p-2 bg-amber-50 rounded border border-amber-200">
                                    <div className="font-medium text-amber-800 mb-1">Check-In Reason:</div>
                                    <div className="text-amber-700">{record.reason}</div>
                                  </div>
                                )}
                                {record.checkOutReason && (
                                  <div className="text-xs p-2 bg-red-50 rounded border border-red-200">
                                    <div className="font-medium text-red-800 mb-1">Check-Out Reason:</div>
                                    <div className="text-red-700">{record.checkOutReason}</div>
                                  </div>
                                )}
                                {!record.reason && !record.checkOutReason && (
                                  <span className="text-xs text-gray-400">—</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {record.latitude && record.longitude ? (
                                <div className="text-xs text-gray-500 font-mono">
                                  <div>Lat: {parseFloat(record.latitude).toFixed(6)}</div>
                                  <div>Lng: {parseFloat(record.longitude).toFixed(6)}</div>
                                </div>
                              ) : record.location ? (
                                <div className="text-xs text-gray-500 font-mono">
                                  {record.location}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400">—</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                            No attendance records found for the selected date range
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}