// C# Crash Course - 11_FileIO.cs
using System;
using System.IO; // Essential for File, StreamWriter, StreamReader, Path, etc.
using System.Text; // For Encoding options if needed
using System.Threading.Tasks; // For async file operations

namespace FileIODemo
{
    class Program
    {
        // Define file paths for the demo
        // Path.Combine is good practice for creating platform-independent paths
        private static readonly string simpleTextFilePath = Path.Combine(Directory.GetCurrentDirectory(), "simplefile.txt");
        private static readonly string streamWriterFilePath = Path.Combine(Directory.GetCurrentDirectory(), "streamoutput.txt");
        private static readonly string asyncFilePath = Path.Combine(Directory.GetCurrentDirectory(), "asyncfile.txt");

        static async Task Main(string[] args) // Main is async to use await for async file I/O
        {
            Console.WriteLine("--- C# File I/O Demo ---");

            // Clean up any existing demo files from previous runs
            CleanUpDemoFiles();
            Console.WriteLine();

            // --- 1. Writing Text to a File ---
            Console.WriteLine("--- 1. Writing Text to a File ---");

            // A. File.WriteAllText() - Creates or overwrites
            try
            {
                string content1 = "Hello from C# File I/O!\nThis is the first line using WriteAllText.";
                File.WriteAllText(simpleTextFilePath, content1);
                Console.WriteLine($"Content written to '{Path.GetFileName(simpleTextFilePath)}' using File.WriteAllText().");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error writing with File.WriteAllText(): {ex.Message}");
            }
            Console.WriteLine();

            // B. File.AppendAllText() - Creates or appends
            try
            {
                string contentToAppend = "\nThis line was appended using File.AppendAllText().";
                File.AppendAllText(simpleTextFilePath, contentToAppend); // Appends to simpleTextFilePath
                Console.WriteLine($"Content appended to '{Path.GetFileName(simpleTextFilePath)}' using File.AppendAllText().");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error appending with File.AppendAllText(): {ex.Message}");
            }
            Console.WriteLine();

            // C. Using StreamWriter (more control, good for line-by-line or larger files)
            Console.WriteLine($"--- Writing with StreamWriter to '{Path.GetFileName(streamWriterFilePath)}' ---");
            try
            {
                // The 'using' statement ensures the StreamWriter is properly disposed (closed).
                using (StreamWriter writer = new StreamWriter(streamWriterFilePath)) // Overwrites if exists
                {
                    writer.WriteLine("Line 1 written by StreamWriter.");
                    writer.WriteLine($"Timestamp: {DateTime.Now}");
                    writer.Write("This is part of a line, ");
                    writer.Write("and this is the rest.\n");
                    writer.WriteLine("End of StreamWriter content.");
                } // writer.Dispose() (which calls .Close()) happens automatically here.
                Console.WriteLine("Content written using StreamWriter.");

                // Appending with StreamWriter
                using (StreamWriter writer = new StreamWriter(streamWriterFilePath, append: true, Encoding.UTF8))
                {
                    writer.WriteLine("This line was appended by StreamWriter with UTF8 encoding.");
                }
                Console.WriteLine("Content appended using StreamWriter.");
            }
            catch (IOException ex)
            {
                Console.WriteLine($"IOException during StreamWriter operation: {ex.Message}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"General error during StreamWriter operation: {ex.Message}");
            }
            Console.WriteLine();


            // --- 2. Reading Text from a File ---
            Console.WriteLine("--- 2. Reading Text from a File ---");

            // A. File.ReadAllText() - Reads entire file into one string
            Console.WriteLine($"--- Reading '{Path.GetFileName(simpleTextFilePath)}' with File.ReadAllText() ---");
            try
            {
                if (File.Exists(simpleTextFilePath))
                {
                    string allContent = File.ReadAllText(simpleTextFilePath);
                    Console.WriteLine("File Content (ReadAllText):");
                    Console.WriteLine(allContent);
                }
                else
                {
                    Console.WriteLine($"File not found: {simpleTextFilePath}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error reading with File.ReadAllText(): {ex.Message}");
            }
            Console.WriteLine();

            // B. File.ReadAllLines() - Reads file into a string array (one element per line)
            Console.WriteLine($"--- Reading '{Path.GetFileName(simpleTextFilePath)}' with File.ReadAllLines() ---");
            try
            {
                if (File.Exists(simpleTextFilePath))
                {
                    string[] lines = File.ReadAllLines(simpleTextFilePath);
                    Console.WriteLine("File Content (ReadAllLines):");
                    foreach (string line in lines)
                    {
                        Console.WriteLine($"> {line}");
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error reading with File.ReadAllLines(): {ex.Message}");
            }
            Console.WriteLine();

            // C. Using StreamReader (efficient for large files, line-by-line reading)
            Console.WriteLine($"--- Reading '{Path.GetFileName(streamWriterFilePath)}' with StreamReader ---");
            try
            {
                if (File.Exists(streamWriterFilePath))
                {
                    using (StreamReader reader = new StreamReader(streamWriterFilePath))
                    {
                        Console.WriteLine("File Content (StreamReader):");
                        string line;
                        while ((line = reader.ReadLine()) != null) // Read until end of file
                        {
                            Console.WriteLine($" >> {line}");
                        }
                    } // reader.Dispose() (which calls .Close()) happens here.
                }
                else
                {
                    Console.WriteLine($"File not found: {streamWriterFilePath}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error reading with StreamReader: {ex.Message}");
            }
            Console.WriteLine();


            // --- 3. Asynchronous File I/O (using async/await) ---
            Console.WriteLine("--- 3. Asynchronous File I/O ---");
            try
            {
                string asyncContent = $"Hello from async file write at {DateTime.Now}\nThis is a test of async I/O.";
                await File.WriteAllTextAsync(asyncFilePath, asyncContent);
                Console.WriteLine($"Content written asynchronously to '{Path.GetFileName(asyncFilePath)}'.");

                string readAsyncContent = await File.ReadAllTextAsync(asyncFilePath);
                Console.WriteLine($"Content read asynchronously from '{Path.GetFileName(asyncFilePath)}':");
                Console.WriteLine(readAsyncContent);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error during async file operations: {ex.Message}");
            }
            Console.WriteLine();


            // --- Other File/Directory Operations (Brief examples) ---
            Console.WriteLine("--- Other File/Directory Info ---");
            if (File.Exists(simpleTextFilePath))
            {
                FileInfo fileInfo = new FileInfo(simpleTextFilePath);
                Console.WriteLine($"File Name: {fileInfo.Name}");
                Console.WriteLine($"File Size: {fileInfo.Length} bytes");
                Console.WriteLine($"Creation Time: {fileInfo.CreationTime}");
                Console.WriteLine($"Full Path: {fileInfo.FullName}");

                // File.Copy / File.Move / File.Delete
                string copiedFilePath = Path.Combine(Directory.GetCurrentDirectory(), "copied_simplefile.txt");
                File.Copy(simpleTextFilePath, copiedFilePath, overwrite: true);
                Console.WriteLine($"Copied '{Path.GetFileName(simpleTextFilePath)}' to '{Path.GetFileName(copiedFilePath)}'.");
                if(File.Exists(copiedFilePath)) File.Delete(copiedFilePath); // Clean up copy
            }

            string demoDirPath = Path.Combine(Directory.GetCurrentDirectory(), "FileIODemoFolder");
            if (!Directory.Exists(demoDirPath))
            {
                Directory.CreateDirectory(demoDirPath);
                Console.WriteLine($"Created directory: '{Path.GetFileName(demoDirPath)}'");
            }
            if (Directory.Exists(demoDirPath))
            {
                Directory.Delete(demoDirPath, recursive: false); // Delete if empty
                Console.WriteLine($"Deleted directory: '{Path.GetFileName(demoDirPath)}'.");
            }
            Console.WriteLine();


            Console.WriteLine("--- End of File I/O Demo ---");

            // Final cleanup
            CleanUpDemoFiles();
        }

        static void CleanUpDemoFiles()
        {
            DeleteFileIfExists(simpleTextFilePath);
            DeleteFileIfExists(streamWriterFilePath);
            DeleteFileIfExists(asyncFilePath);
        }

        static void DeleteFileIfExists(string path)
        {
            try
            {
                if (File.Exists(path))
                {
                    File.Delete(path);
                    // Console.WriteLine($"Cleaned up: {Path.GetFileName(path)}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error cleaning up file {Path.GetFileName(path)}: {ex.Message}");
            }
        }
    }
}
// Note: File operations can be affected by permissions and whether files are locked by other processes.
// Always include error handling (try-catch) when working with files.
// The `using` statement is crucial for IDisposable objects like StreamReader/StreamWriter.
