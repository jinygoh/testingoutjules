// C# Crash Course - 02_BasicSyntax.cs

using System; // Imports the System namespace, making Console.WriteLine available

// Namespaces are used to organize code and prevent naming conflicts.
namespace BasicSyntaxDemo
{
    // A class is a blueprint for creating objects.
    // For console apps, a 'Program' class with a 'Main' method is common.
    class Program
    {
        // The Main method is the entry point of a C# console application.
        // 'static' means it belongs to the Program class itself, not an instance.
        // 'void' means it doesn't return any value.
        // 'string[] args' can be used to pass command-line arguments to the program.
        static void Main(string[] args)
        {
            // --- Hello World & Basic Output ---
            Console.WriteLine("Hello, World from 02_BasicSyntax.cs!");
            Console.WriteLine("--- End of Hello World ---");
            Console.WriteLine(); // Prints a blank line

            // --- Comments ---
            // This is a single-line comment.
            /*
             * This is a
             * multi-line comment.
             * It can span several lines.
             */

            /// <summary>
            /// This is an XML documentation comment.
            /// Used for generating documentation.
            /// Often used for classes and methods.
            /// </summary>

            // --- Variables and Data Types ---
            Console.WriteLine("--- Variables and Data Types ---");

            // Integers (whole numbers)
            int age = 30;               // Standard integer, 32-bit signed
            long bigNumber = 9000000000L; // Large integer, 64-bit signed (L suffix)
            short smallNumber = 1000;   // Small integer, 16-bit signed
            byte verySmallPositiveNumber = 250; // Unsigned byte (0-255)
            Console.WriteLine("Age: " + age);
            Console.WriteLine("Big Number: " + bigNumber);
            Console.WriteLine("Small Number: " + smallNumber);
            Console.WriteLine("Byte Value: " + verySmallPositiveNumber);
            Console.WriteLine();

            // Floating-Point Numbers (numbers with decimals)
            float itemPrice = 29.95f;      // Single-precision float (f suffix required)
            double piApproximation = 3.141592653589793; // Double-precision (default for literals like 3.14)
            decimal accountBalance = 12345.67m; // High-precision decimal for financial/monetary (m suffix required)
            Console.WriteLine("Item Price (float): " + itemPrice);
            Console.WriteLine("Pi (double): " + piApproximation);
            Console.WriteLine("Account Balance (decimal): " + accountBalance);
            Console.WriteLine();

            // Character
            char initial = 'A';         // Single Unicode character (single quotes)
            char anotherChar = '\u0058'; // Unicode representation for 'X'
            Console.WriteLine("Initial: " + initial);
            Console.WriteLine("Another Char (Unicode U0058): " + anotherChar);
            Console.WriteLine();

            // Boolean
            bool isActive = true;       // Represents true or false
            bool isCompleted = false;
            Console.WriteLine("Is Active: " + isActive);
            Console.WriteLine("Is Completed: " + isCompleted);
            Console.WriteLine();

            // String
            string greeting = "Hello, C#!"; // Sequence of characters (double quotes)
            string filePath = "C:\\Users\\YourName\\Documents"; // Verbatim string literal allows backslashes
            string multilineString = @"This is a
multi-line string
using a verbatim literal.";
            Console.WriteLine("Greeting: " + greeting);
            Console.WriteLine("File Path: " + filePath);
            Console.WriteLine(multilineString);

            // String interpolation (a more convenient way to build strings)
            string name = "Alice";
            int score = 100;
            string message = $"Player {name} scored {score} points."; // Note the $
            Console.WriteLine(message);
            Console.WriteLine();

            // Object type (can hold any type, base for all types)
            object anyValue = 100;          // Storing an int
            Console.WriteLine("Object as int: " + anyValue);
            anyValue = "Some text";         // Storing a string
            Console.WriteLine("Object as string: " + anyValue);
            anyValue = true;                // Storing a bool
            Console.WriteLine("Object as bool: " + anyValue);
            Console.WriteLine();

            // --- Type Inference with var ---
            Console.WriteLine("--- Type Inference with var ---");
            var count = 500;                // Compiler infers 'int'
            var welcomeMessage = "Welcome!";  // Compiler infers 'string'
            var isReady = true;             // Compiler infers 'bool'
            var preciseNumber = 19.99m;     // Compiler infers 'decimal' (due to 'm' suffix)
            var anotherFloat = 12.3f;       // Compiler infers 'float' (due to 'f' suffix)
            // var something; // Error: var must be initialized at declaration.
            // count = "test"; // Error: 'count' is inferred as int, cannot assign string.

            Console.WriteLine($"Var 'count' (inferred int): {count}");
            Console.WriteLine($"Var 'welcomeMessage' (inferred string): {welcomeMessage}");
            Console.WriteLine($"Var 'isReady' (inferred bool): {isReady}");
            Console.WriteLine($"Var 'preciseNumber' (inferred decimal): {preciseNumber}");
            Console.WriteLine($"Var 'anotherFloat' (inferred float): {anotherFloat}");
            Console.WriteLine();

            // --- Constants ---
            Console.WriteLine("--- Constants ---");
            const double PI = 3.14159265359; // Value cannot be changed after declaration
            const string CompanyName = "MyCSharpLearners Inc.";
            // PI = 3.14; // This would cause a compile-time error.
            // CompanyName = "New Name"; // This would also cause an error.

            Console.WriteLine("Constant PI: " + PI);
            Console.WriteLine("Company Name: " + CompanyName);
            Console.WriteLine();


            // --- Nullable Value Types ---
            Console.WriteLine("--- Nullable Value Types ---");
            // Value types (int, double, bool, struct, etc.) cannot normally be null.
            // To allow them to be null, use the '?' suffix.
            int? nullableInt = null;
            double? nullableDouble = 3.14;
            bool? nullableBool = null;

            Console.WriteLine($"NullableInt: {nullableInt}"); // Prints nothing or a specific representation for null
            Console.WriteLine($"NullableDouble: {nullableDouble}");
            Console.WriteLine($"NullableBool has value: {nullableBool.HasValue}"); // Check if it has a value

            nullableInt = 100;
            if (nullableInt.HasValue)
            {
                Console.WriteLine($"NullableInt has value: {nullableInt.Value}"); // Access value safely
            }

            // Null-coalescing operator (??)
            int nonNullable = nullableInt ?? 0; // If nullableInt is null, use 0, otherwise use its value.
            Console.WriteLine($"NonNullable (from nullableInt ?? 0): {nonNullable}");

            int? anotherNullableInt = null;
            int nonNullable2 = anotherNullableInt ?? -1;
             Console.WriteLine($"NonNullable2 (from anotherNullableInt ?? -1): {nonNullable2}");
            Console.WriteLine();


            Console.WriteLine("--- End of Basic Syntax Demo ---");
            // Keep the console window open in some environments until a key is pressed.
            // Console.ReadKey(); // You can uncomment this if your console closes immediately.
        }
    }
}
