"use client"
import {
    useEffect,
    useState
} from "react"
import {
    toast
} from "sonner"
import {
    useForm
} from "react-hook-form"
import {
    zodResolver
} from "@hookform/resolvers/zod"
import {
    z
} from "zod"
import {
    cn
} from "@/lib/utils"
import {
    Button
} from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Input
} from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import {
    TagsInput
} from "@/components/ui/tags-input"
import {
    CloudUpload,
    Paperclip
} from "lucide-react"
import {
    FileInput,
    FileUploader,
    FileUploaderContent,
    FileUploaderItem
} from "@/components/ui/file-upload"
import { Check, ChevronsUpDown } from "lucide-react"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { createClient } from "@/utils/supabase/client"
import { Controller } from "react-hook-form"

const formSchema = z.object({
    title: z.string().min(1),
    description: z.string(),
    AcademicYear: z.string(),
    semester: z.string(),
    subject: z.string(),
    codeName: z.string().optional(),
    tags: z.array(z.string()).optional(),
    courseCode: z.string().optional(),
    notes: z.string().optional(),
    files: z.array(z.string()).optional(),
});

const subjects = [
    { label: "Mathematics I", value: "Mathematics I" },
    { label: "DBMS", value: "DBMS" },
    { label: "Computer Networks", value: "Computer Networks" },
]

export default function MyForm() {

    const [files, setFiles] = useState<File[] | null>(null);
    const [uploading, setIsUploading] = useState(false);
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState("")
    const [subjectOptions, setSubjectOptions] = useState<{ label: string, value: string }[]>([]);


    const academicYearOptions = [
        { value: "1", label: "1st Year" },
        { value: "2", label: "2nd Year" },
        { value: "3", label: "3rd Year" },
        { value: "4", label: "4th Year" }
    ];

    // Define semester options based on academic year
    const semesterOptions = {
        "1": [
            { value: "1", label: "Semester 1" },
            { value: "2", label: "Semester 2" }
        ],
        "2": [
            { value: "3", label: "Semester 3" },
            { value: "4", label: "Semester 4" }
        ],
        "3": [
            { value: "5", label: "Semester 5" },
            { value: "6", label: "Semester 6" }
        ],
        "4": [
            { value: "7", label: "Semester 7" },
            { value: "8", label: "Semester 8" }
        ]
    };


    const dropZoneConfig = {
        maxFiles: 1,
        maxSize: 1024 * 1024 * 10,
        multiple: false,
    };
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            // "tags": ["test"]
            title: "",
            description: "",
            AcademicYear: "",
            semester: "",
            subject: "",
            codeName: "",
            tags: [],
            courseCode: "",
            notes: ""
        },
    })

    useEffect(() => {
        const year = form.watch('AcademicYear');
        const semester = form.watch('semester');

        if (year && semester) {
            const fetchSubjects = async () => {
                const supabase = createClient();
                const { data, error } = await supabase
                    .from("subjects")
                    .select("name")
                    .eq("academic_year", year)
                    .eq("semester", semester);

                if (!error && data) {
                    setSubjectOptions(
                        data.map((s: any) => ({
                            label: s.name,
                            value: s.name
                        }))
                    )
                } else {
                    setSubjectOptions([]);
                }
            }
            fetchSubjects();
        }
        else {
            setSubjectOptions([]);
        }

    }, [form.watch("AcademicYear"), form.watch("semester")])


    async function uploadFile(file: File, pathPrefix = 'notes') {
        const supabase = createClient();
        const user = await createClient().auth.getUser();
        const userId = user?.data?.user?.id;
        if (!userId) throw new Error("User not authenticated");


        console.log("User ID:", user.data.user?.id);
        const filePath = `${pathPrefix}/${userId}/${Date.now()}-${file.name}`;
        console.log(filePath);
        const { data, error } = await supabase.storage
            .from("notes") // your bucket name
            .upload(filePath, file, {
                cacheControl: "3600",
                upsert: true,
            });

        if (error) throw error;

        const { data: publicUrlData } = supabase
            .storage
            .from("notes")
            .getPublicUrl(filePath);

        return {
            file_url: publicUrlData.publicUrl,
            file_type: file.type
        }

    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        console.log("hi");
        setIsUploading(true);
        try {
            console.log(values);
            console.log(files);
            if (!files || files.length === 0) {
                toast.error("Please select at least one file to upload.");
                return;
            }
            toast.loading("Uploading notes...");
            const uploadPromises = files.map(file => uploadFile(file));
            const uploadResults = await Promise.all(uploadPromises);
            const uploadedFile = uploadResults[0];
            //Upload in the table logic start:
            const supabase = createClient();
            const user = await createClient().auth.getUser();
            const userId = user?.data?.user?.id;
            const { data, error } = await supabase
                .from('users')
                .select('first_name, last_name')
                .eq('id', userId)
                .single(); // if you're expecting one row only
            const username = data?.first_name + ' ' + data?.last_name;
            const notesData = {
                user_id: userId, //~~~~
                uploader_name: username, //~~~
                description: values.description,
                title: values.title,
                subject: values.subject,
                academic_year: values.AcademicYear,
                semester: values.semester,
                file_url: uploadedFile.file_url, //~~~
                file_type: uploadedFile.file_type, //~~~
                uploaded_at: new Date().toISOString(),
                likes: 0,
                tags: values.tags,
            }

            const { error: insertError } = await supabase.from('notes').insert(notesData);
            if (insertError) {
                toast.error("Failed to save note metadata.");
                console.error(insertError);
            } else {
                toast.success("Note uploaded successfully!");
                //Upload in the table logic end:
                toast.success("Files uploaded successfully!");
                form.reset();
                setFiles(null);
            }
        } catch (error) {
            console.error("Form submission error", error);
            toast.error("Failed to submit the form. Please try again.");
        }
        finally {
            setIsUploading(false);
        }
    }

    return (
        <div className="mr-5">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit,
                    (errors) => {
                        console.error("❌ Validation Errors:", errors);
                    }
                )} className="space-y-8 max-w-3xl mx-auto py-10">

                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder=""

                                        type="text"
                                        {...field} />
                                </FormControl>
                                <FormDescription>Enter title.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder=""

                                        type="text"
                                        {...field} />
                                </FormControl>
                                <FormDescription>Description</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-12 gap-4">

                        <div className="col-span-6">

                            <FormField
                                control={form.control}
                                name="AcademicYear"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Academic Year</FormLabel>
                                        <Select onValueChange={(value) => { field.onChange(value); form.setValue("semester", ""); }} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select academic year" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {academicYearOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>Select the academic year of the notes.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="col-span-6">

                            <FormField
                                control={form.control}
                                name="semester"
                                render={({ field }) => {
                                    const selectedYear = form.watch("AcademicYear");
                                    const availableSemesters = selectedYear ? semesterOptions[selectedYear as keyof typeof semesterOptions] || [] : [];
                                    return (
                                        <FormItem>
                                            <FormLabel>Semester</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedYear}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={
                                                            selectedYear ? "Select Academic Semester" : "Select Academic Year first"} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {availableSemesters.map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>Select Academic Semester For Notes</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )
                                }}
                            />
                        </div>

                    </div>

                    <div className="grid grid-cols-12 gap-4">

                        <div className="col-span-6">


                            <Controller
                                control={form.control}
                                name="subject"
                                render={({ field }) => {
                                    const selected = subjectOptions.find((item) => item.value === field.value);

                                    return (
                                        <FormItem>
                                            <FormLabel>Subject</FormLabel>
                                            <FormControl>
                                                <Popover open={open} onOpenChange={setOpen}>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            role="combobox"
                                                            aria-expanded={open}
                                                            className="w-[200px] justify-between"
                                                        >
                                                            {selected ? selected.label : "Select subject..."}
                                                            <ChevronsUpDown className="opacity-50" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-[200px] p-0">
                                                        <Command>
                                                            <CommandInput placeholder="Search subject..." className="h-9" />
                                                            <CommandList>
                                                                <CommandEmpty>No subject found.</CommandEmpty>
                                                                <CommandGroup>
                                                                    {subjectOptions.map((subject) => (
                                                                        <CommandItem
                                                                            key={subject.value}
                                                                            value={subject.value}
                                                                            onSelect={(value) => {
                                                                                field.onChange(value);
                                                                                setOpen(false);
                                                                            }}
                                                                        >
                                                                            {subject.label}
                                                                            <Check
                                                                                className={cn(
                                                                                    "ml-auto",
                                                                                    value === field.value ? "opacity-100" : "opacity-0"
                                                                                )}
                                                                            />
                                                                        </CommandItem>
                                                                    ))}
                                                                </CommandGroup>
                                                            </CommandList>
                                                        </Command>
                                                    </PopoverContent>
                                                </Popover>
                                            </FormControl>
                                            <FormDescription>
                                                Select the subject. If not available, choose other.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    );
                                }}
                            />




                        </div>

                        <div className="col-span-6">

                            <FormField
                                control={form.control}
                                name="tags"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Enter your tags</FormLabel>
                                        <FormControl>
                                            <TagsInput
                                                value={field.value || []}
                                                onValueChange={field.onChange}
                                                placeholder="Enter your tags"
                                            />
                                        </FormControl>
                                        <FormDescription>Add tags.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                    </div>


                    <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Select File</FormLabel>
                                <FormControl>
                                    <FileUploader
                                        value={files}
                                        onValueChange={setFiles}
                                        dropzoneOptions={dropZoneConfig}
                                        className="relative bg-background rounded-lg p-2"
                                    >
                                        <FileInput
                                            id="fileInput"
                                            className="outline-dashed outline-1 outline-slate-500"
                                        >
                                            <div className="flex items-center justify-center flex-col p-8 w-full ">
                                                <CloudUpload className='text-gray-500 w-10 h-10' />
                                                <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                                                    <span className="font-semibold">Click to upload</span>
                                                    &nbsp; or drag and drop
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    SVG, PNG, JPG or GIF
                                                </p>
                                            </div>
                                        </FileInput>
                                        <FileUploaderContent>
                                            {files &&
                                                files.length > 0 &&
                                                files.map((file, i) => (
                                                    <FileUploaderItem key={i} index={i}>
                                                        <Paperclip className="h-4 w-4 stroke-current" />
                                                        <span>{file.name}</span>
                                                    </FileUploaderItem>
                                                ))}
                                        </FileUploaderContent>
                                    </FileUploader>
                                </FormControl>
                                <FormDescription>Select a single file to upload (PDF, Images, Documents).</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={uploading}>Submit</Button>
                </form>
            </Form>
        </div>
    )
}