"use client"

import { useState,useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { any, z } from "zod"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { PhoneInput } from "@/components/ui/phone-input"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"
import LocationSelector from "@/components/ui/location-input"
import { createClient } from "@/utils/supabase/client"
import { redirect } from "next/navigation"


const formSchema = z.object({
  firstName: z.string().min(1),
  middleName: z.string().min(1),
  lastName: z.string().min(1),
  phoneNumber: z.string().optional(),
  dateOfBirth: z.coerce.date(),
  gender: z.string().optional(),
  email: z.string().email(),
  institute: z.string().optional(),
  branch: z.string().optional(),
  division: z.string().min(1).max(1),
  rollNo: z.string().min(8).max(8),
  academicYear: z.number().min(1).max(4),
  country: z.tuple([z.string().min(1), z.string().optional()]),
  city: z.string().min(1),
  nationality: z.string().min(1),
  github: z.string().optional(),
  linkedin: z.string().optional(),
  leetcode: z.string().optional(),
  codeforces: z.string().optional()
})

const steps = [
  { title: "Personal Information", description: "Basic personal details" },
  { title: "Academic Information", description: "Educational background" },
  { title: "Location Information", description: "Geographic details" },
  { title: "Social Profiles", description: "Professional profiles" }
]

export default function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [countryName, setCountryName] = useState('')
  const [stateName, setStateName] = useState('')
  const [nationalityCountry, setNationalityCountry] = useState('')
  

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      phoneNumber: "",
      dateOfBirth: new Date(),
      gender: "",
      email: "",
      institute: "",
      branch: "",
      division: "",
      rollNo: "",
      academicYear: undefined,
      country: ["", ""],
      city: "",
      nationality: "",
      github: "",
      linkedin: "",
      leetcode: "",
      codeforces: ""
    }
  })

  const getStepFields = (step: number) => {
    switch (step) {
      case 0:
        return ['firstName', 'middleName', 'lastName', 'phoneNumber', 'dateOfBirth', 'gender', 'email'] as const
      case 1:
        return ['institute', 'branch', 'division', 'rollNo', 'academicYear'] as const
      case 2:
        return ['country.0', 'country.1', 'city', 'nationality'] as const
      case 3:
        return ['github', 'linkedin', 'leetcode', 'codeforces'] as const
      default:
        return [] as const
    }
  }

  useEffect(()=>{
    const fetchUserData = async () => {
      const supabase = createClient();
      const { data: user } = await supabase.auth.getUser();
      console.log("User data:", user.user);
      if (user.user) {
        const {data, error} = await supabase
          .from('users')
          .select('*')
          .eq('id', user.user.id)
          .single();

          if (data) {
            form.reset({
              firstName: data.first_name || "",
              middleName: data.middle_name || "",
              lastName: data.last_name || "",
              phoneNumber: data.phone_number || "",
              dateOfBirth: data.dob ? new Date(data.dob) : new Date(),
              email: data.personal_gmail || "",
              institute: data.institute || "",
              branch: data.branch || "",
              division: data.division || "",
              gender: data.gender || "",
              rollNo: data.roll_no || "",
              academicYear: data.academic_year || undefined,
              country: [data.country || "", data.state || ""],
              city: data.city || "",
              nationality: data.nationality || "",
              github: data.github || "",
              linkedin: data.linkedin || "",
              leetcode: data.leetcode || "",
              codeforces: data.codeforces || ""
            })
            setNationalityCountry(data.nationality || '');
            setCountryName(data.country || '');
            setStateName(data.state || '');
          }
      }
    }
    fetchUserData();
  },[])

  const nextStep = async () => {
    const isValid = await form.trigger(getStepFields(currentStep))
    if (isValid) setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
  }

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0))

  const onSubmit = async(values: any) => {
    console.log(values)
    toast("Form submitted successfully")
    const dataToInsert = {
      first_name: values.firstName,
      middle_name: values.middleName,
      last_name: values.lastName,
      phone_number: values.phoneNumber,
      dob: values.dateOfBirth,
      institute: values.institute,
      branch: values.branch,
      division: values.division,
      roll_no: values.rollNo,
      academic_year: values.academicYear,
      country: values.country[0],
      state: values.country[1] || stateName,
      city: values.city,
      nationality: values.nationality,
      personal_gmail: values.email,
      github: values.github,
      linkedin: values.linkedin,
      leetcode: values.leetcode,
      codeforces: values.codeforces,
      gender: values.gender,
      verified: true,
    }
    const sendData = async () => {
      const supabase = createClient();
      const { data: user} = await supabase.auth.getUser();
      
      const { data , error} = await supabase
      .from('users')
      .update(dataToInsert)
      .eq('id', user.user?.id)

      if (error) {
        console.error("Error inserting data:", error);
        toast.error("Failed to submit form. Please try again.");
      } else {
        console.log("Data inserted successfully:", data); 
        toast.success("Form submitted successfully!");
      }
    }
    await sendData();
    redirect('/home');
  }

  return (
    <div className="container flex items-center justify-center min-h-screen min-w-screen">
      <div className="top-0 left-0 h-screen w-[50vw] bg-neutral-900 flex items-center justify-center">
        <div className="text-center px-8">
          <h1 className="text-5xl font-semibold text-white leading-tight mb-4">
            Welcome to <span className="text-yellow-400">MyNirma</span>
          </h1>
          <p className="text-neutral-300 text-lg max-w-md mx-auto">
            Empowering your academic journey with seamless digital access and personalized tools.
          </p>
        </div>
      </div>
      <div className="p-50 w-screen mx-auto py-10 bg-gray-50 rounded-lg shadow-md ">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                    index <= currentStep
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 w-20 mx-2",
                      index < currentStep ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold">{steps[currentStep].title}</h2>
            <p className="text-muted-foreground">{steps[currentStep].description}</p>
          </div>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

            {/* Step 1 */}
            <div className={currentStep === 0 ? "" : "hidden"}>
              <div className="space-y-6">
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormDescription>Your first name</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="col-span-4">
                    <FormField
                      control={form.control}
                      name="middleName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Middle Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Michael" {...field} />
                          </FormControl>
                          <FormDescription>Your middle name</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="col-span-4">
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormDescription>Your last name</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-start">
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl className="w-full">
                        <PhoneInput
                          placeholder="Enter phone number"
                          {...field}
                          defaultCountry="IN"
                        />
                      </FormControl>
                      <FormDescription>Enter your phone number</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-6">
                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Date of Birth</FormLabel>
                          <div className="space-y-4">

                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-[280px] pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={(date) => field.onChange(date)}
                                  captionLayout="dropdown"
                                  fromYear={1900}
                                  toYear={new Date().getFullYear()}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                          <FormDescription>Your date of birth</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-6">
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>Select your gender</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="john@example.com" type="email" {...field} />
                      </FormControl>
                      <FormDescription>Your email address</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              </div>
            </div>

            {/* Step 2 */}
            <div className={currentStep === 1 ? "" : "hidden"}>
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="institute"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Institute</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select institute" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Institue of Technology">Institue of Technology</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>Select your institute</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-6">
                    <FormField
                      control={form.control}
                      name="branch"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Branch</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select branch" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="cse">CSE</SelectItem>
                              <SelectItem value="ece">ECE</SelectItem>
                              <SelectItem value="me">EI</SelectItem>
                              <SelectItem value="cse">Mechanical</SelectItem>
                              <SelectItem value="ece">Chemical</SelectItem>
                              <SelectItem value="me">Civil</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>Select your branch</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="col-span-6">
                    <FormField
                      control={form.control}
                      name="division"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Division</FormLabel>
                          <FormControl>
                            <Input placeholder="A" type="text" maxLength={1} {...field} />
                          </FormControl>
                          <FormDescription>Your division (A, B, C, etc.)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="rollNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Roll Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="22BCE236"
                          type="text"
                          maxLength={8}
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>Enter your 8-character roll number</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="academicYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Academic Year</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select academic year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">1st Year</SelectItem>
                          <SelectItem value="2">2nd Year</SelectItem>
                          <SelectItem value="3">3rd Year</SelectItem>
                          <SelectItem value="4">4th Year</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>Select your current academic year</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Step 3 */}
            <div className={currentStep === 2 ? "" : "hidden"}>
              <div className="space-y-6">
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-6">
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <LocationSelector
                              
                              defaultCountryName={countryName}
                              defaultStateName={stateName}
                              onCountryChange={(country) => {
                                setCountryName(country?.name || '')
                                form.setValue(field.name, [country?.name || '', stateName || ''])
                              }}
                              onStateChange={(state) => {
                                setStateName(state?.name || '')
                                form.setValue(field.name, [form.getValues(field.name)?.[0] || '', state?.name || ''])
                              }}
                            />
                          </FormControl>
                          <FormDescription>Select your home country</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="City" type="text" {...field} />
                      </FormControl>
                      <FormDescription>Enter your home city</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nationality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nationality</FormLabel>
                      <FormControl>
                        <LocationSelector
                          defaultCountryName={nationalityCountry}
                          showStates={false}
                          onCountryChange={(country) => {
                            setNationalityCountry(country?.name || '')
                            form.setValue(field.name, country?.name || '')
                          }}
                        />
                      </FormControl>
                      <FormDescription>Select your nationality</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Step 4 */}
            <div className={currentStep === 3 ? "" : "hidden"}>
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="github"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GitHub Profile</FormLabel>
                      <FormControl>
                        <Input placeholder="https://github.com/username" type="url" {...field} />
                      </FormControl>
                      <FormDescription>Enter your GitHub profile URL</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="linkedin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn Profile</FormLabel>
                      <FormControl>
                        <Input placeholder="https://linkedin.com/in/username" type="url" {...field} />
                      </FormControl>
                      <FormDescription>Enter your LinkedIn profile URL</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="leetcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LeetCode Profile</FormLabel>
                      <FormControl>
                        <Input placeholder="https://leetcode.com/username" type="url" {...field} />
                      </FormControl>
                      <FormDescription>Enter your LeetCode profile URL</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="codeforces"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Codeforces Profile</FormLabel>
                      <FormControl>
                        <Input placeholder="https://codeforces.com/profile/username" type="url" {...field} />
                      </FormControl>
                      <FormDescription>Enter your Codeforces profile URL</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-between pt-6">
              <Button type="button" onClick={prevStep} disabled={currentStep === 0}>
                <ChevronLeft className="w-4 h-4" /> Previous
              </Button>
              {currentStep < steps.length - 1 ? (
                <Button type="button" onClick={nextStep}>
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button type="submit">Submit Form</Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
