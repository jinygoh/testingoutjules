// C# Crash Course - 08_ExceptionHandling.cs
using System;
using System.IO; // For file operations and IOException

namespace ExceptionHandlingDemo
{
    // --- 4. Creating Custom Exceptions ---
    public class MinorAgeException : Exception
    {
        public int AttemptedAge { get; }

        public MinorAgeException() { }
        public MinorAgeException(string message) : base(message) { }
        public MinorAgeException(string message, Exception inner) : base(message, inner) { }

        public MinorAgeException(string message, int attemptedAge) : base(message)
        {
            AttemptedAge = attemptedAge;
        }

        public override string Message // Override Message to include custom property
        {
            get
            {
                return base.Message + $" (Attempted Age: {AttemptedAge})";
            }
        }
    }


    class Program
    {
        // Method that might throw different exceptions
        public static int ProcessNumbers(string input1, string input2)
        {
            int num1 = 0;
            int num2 = 0;

            // This inner try-catch handles FormatException specifically for parsing
            try
            {
                num1 = int.Parse(input1);
                num2 = int.Parse(input2);
            }
            catch (FormatException ex)
            {
                // Log or handle the format error locally, then re-throw a more specific custom exception
                // or let it propagate if the caller should handle FormatException.
                // For this demo, we'll wrap it or just let it be caught by the outer handler.
                Console.WriteLine($"Inner catch: Invalid number format - {ex.Message}");
                throw; // Re-throws the original FormatException
            }

            if (num2 == 0)
            {
                // --- 2. Throwing Exceptions ---
                throw new DivideByZeroException("Cannot divide by zero in ProcessNumbers.");
            }
            return num1 / num2;
        }

        public static void CheckAge(int age)
        {
            if (age < 18)
            {
                throw new MinorAgeException("Person must be 18 or older.", age);
            }
            Console.WriteLine("Age is valid.");
        }

        public static void ReadFileContent(string filePath)
        {
            StreamReader reader = null;
            try
            {
                if (string.IsNullOrEmpty(filePath))
                {
                    throw new ArgumentNullException(nameof(filePath), "File path cannot be null or empty.");
                }

                reader = new StreamReader(filePath);
                string content = reader.ReadToEnd();
                Console.WriteLine("File Content:");
                Console.WriteLine(content);
            }
            catch (FileNotFoundException ex)
            {
                Console.WriteLine($"Error: File not found - {ex.FileName}");
                Console.WriteLine($"Details: {ex.Message}");
            }
            catch (ArgumentNullException ex)
            {
                Console.WriteLine($"Error: Invalid argument - {ex.ParamName}");
                Console.WriteLine($"Details: {ex.Message}");
            }
            catch (IOException ex) // Catches other I/O related errors
            {
                Console.WriteLine($"An I/O error occurred: {ex.Message}");
            }
            catch (Exception ex) // General catch block (should be last)
            {
                Console.WriteLine($"An unexpected error occurred while reading file: {ex.GetType().Name} - {ex.Message}");
            }
            finally
            {
                // --- finally block for cleanup ---
                if (reader != null)
                {
                    Console.WriteLine("Closing the file reader in finally block.");
                    reader.Close(); // Ensure resources are released
                    reader.Dispose();
                }
            }
        }

        static void Main(string[] args)
        {
            Console.WriteLine("--- C# Exception Handling Demo ---");
            Console.WriteLine();

            // --- 1. try-catch-finally basic structure ---
            Console.WriteLine("--- Example 1: Division ---");
            try
            {
                // int result = ProcessNumbers("10", "2"); // Valid
                // int result = ProcessNumbers("10", "0"); // DivideByZeroException
                int result = ProcessNumbers("ten", "2");  // FormatException
                Console.WriteLine($"Result of division: {result}");
            }
            catch (DivideByZeroException ex)
            {
                Console.WriteLine($"Outer Catch (DivideByZeroException): {ex.Message}");
            }
            catch (FormatException ex)
            {
                Console.WriteLine($"Outer Catch (FormatException): Invalid number format. Details: {ex.Message}");
                // Console.WriteLine($"Stack Trace: {ex.StackTrace}");
            }
            catch (Exception ex) // A general catch block for any other exceptions
            {
                Console.WriteLine($"Outer Catch (General Exception): An unexpected error occurred: {ex.GetType().Name} - {ex.Message}");
            }
            finally
            {
                Console.WriteLine("Division example finally block executed.");
                Console.WriteLine();
            }


            // --- Example with File I/O and multiple specific catches ---
            Console.WriteLine("--- Example 2: File Reading ---");
            // Create a dummy file for testing success case
            string testFilePath = "testfile.txt";
            File.WriteAllText(testFilePath, "This is a test file for exception handling demo.");

            ReadFileContent(testFilePath); // Successful case
            Console.WriteLine();
            ReadFileContent("nonexistentfile.txt"); // FileNotFoundException case
            Console.WriteLine();
            ReadFileContent(null); // ArgumentNullException case
            Console.WriteLine();

            // Clean up dummy file
            if (File.Exists(testFilePath)) File.Delete(testFilePath);


            // --- Example with Custom Exception ---
            Console.WriteLine("--- Example 3: Custom Exception (MinorAgeException) ---");
            try
            {
                CheckAge(25); // Valid age
                CheckAge(16); // Will throw MinorAgeException
            }
            catch (MinorAgeException ex)
            {
                Console.WriteLine($"Error (MinorAgeException): {ex.Message}");
                // Access custom property: Console.WriteLine($"Attempted Age was: {ex.AttemptedAge}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An unexpected error occurred during age check: {ex.Message}");
            }
            finally
            {
                Console.WriteLine("Age check finally block executed.");
                Console.WriteLine();
            }

            // --- Using statement for IDisposable (Recommended for resource management) ---
            Console.WriteLine("--- Example 4: 'using' statement for IDisposable ---");
            string usingTestFile = "usingTest.txt";
            try
            {
                // The 'using' statement ensures Dispose() is called even if exceptions occur.
                // StreamReader implements IDisposable.
                using (StreamWriter writer = new StreamWriter(usingTestFile))
                {
                    writer.WriteLine("Hello from using statement!");
                    // Simulate an error after opening the file but before explicit close
                    // throw new InvalidOperationException("Simulated error within using block.");
                } // writer.Dispose() (which includes Close()) is called automatically here.
                Console.WriteLine($"Content written to {usingTestFile} and file closed/disposed.");

                using (StreamReader reader = new StreamReader(usingTestFile))
                {
                    Console.WriteLine($"Content read from {usingTestFile}: {reader.ReadLine()}");
                } // reader.Dispose() called here.
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error with using statement example: {ex.Message}");
            }
            finally
            {
                 if (File.Exists(usingTestFile)) File.Delete(usingTestFile);
                 Console.WriteLine("'using' statement example finally actions (if any).");
            }
            Console.WriteLine();


            Console.WriteLine("--- End of Exception Handling Demo ---");
        }
    }
}
