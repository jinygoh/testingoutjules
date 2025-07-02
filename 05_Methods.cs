// C# Crash Course - 05_Methods.cs
using System;

namespace MethodsDemo
{
    class Program
    {
        // --- 1. Defining and Calling Methods ---

        // A simple method that doesn't return a value (void) and takes no parameters.
        // This is an instance method (not static), so it needs an object of Program to be called from outside Main (if Main wasn't static)
        // or can be called directly if it were static or from an instance within Main.
        // For simplicity in console apps, we often make helper methods static if they don't rely on instance state.
        public static void Greet()
        {
            Console.WriteLine("Hello from the Greet method!");
        }

        // A method that takes parameters and returns a value.
        public static int AddNumbers(int num1, int num2)
        {
            int sum = num1 + num2;
            return sum; // Returns the calculated sum
        }

        // --- 3. Method Overloading ---
        // Multiple methods with the same name but different parameters.

        // Overload 1: Adds two integers
        public static int Calculate(int a, int b)
        {
            Console.WriteLine("Called Calculate(int, int)");
            return a + b;
        }

        // Overload 2: Adds two doubles
        public static double Calculate(double a, double b)
        {
            Console.WriteLine("Called Calculate(double, double)");
            return a + b;
        }

        // Overload 3: Adds three integers
        public static int Calculate(int a, int b, int c)
        {
            Console.WriteLine("Called Calculate(int, int, int)");
            return a + b + c;
        }

        // Overload 4: Concatenates two strings
        public static string Calculate(string str1, string str2)
        {
            Console.WriteLine("Called Calculate(string, string)");
            return str1 + " " + str2;
        }

        // --- 4. Optional and Named Arguments ---

        // Method with an optional parameter (country has a default value)
        public static void RegisterUser(string username, int age, string country = "Unknown")
        {
            Console.WriteLine($"New User: Username='{username}', Age={age}, Country='{country}'");
        }

        // --- 5. Expression-Bodied Members ---
        // Concise syntax for single-expression methods (C# 6.0+)

        public static int Multiply(int a, int b) => a * b;

        public static void PrintMessage(string message) => Console.WriteLine($"Message: {message}");

        // --- 6. ref and out Parameters ---

        // 'ref' parameter: passes the argument by reference. Variable must be initialized.
        public static void DoubleValueByRef(ref int number)
        {
            number = number * 2;
        }

        // 'out' parameter: passes by reference. Variable doesn't need to be initialized before call.
        // Method MUST assign a value to the out parameter.
        // Useful for methods that need to "return" multiple values.
        public static bool TryDivide(int dividend, int divisor, out double result)
        {
            if (divisor == 0)
            {
                result = 0; // Must assign to out parameter even on failure path
                return false; // Indicate failure
            }
            result = (double)dividend / divisor;
            return true; // Indicate success
        }


        static void Main(string[] args)
        {
            Console.WriteLine("--- C# Methods Demo ---");
            Console.WriteLine();

            // Calling the Greet method
            Console.WriteLine("--- 1. Defining and Calling Methods ---");
            Greet(); // Direct call because Greet is static and in the same class
            Console.WriteLine();

            // Calling AddNumbers and storing the result
            int number1 = 10;
            int number2 = 5;
            int sumResult = AddNumbers(number1, number2);
            Console.WriteLine($"The sum of {number1} and {number2} is: {sumResult}");
            Console.WriteLine();

            // --- 3. Method Overloading ---
            Console.WriteLine("--- 3. Method Overloading ---");
            Console.WriteLine($"Calculate(5, 3): {Calculate(5, 3)}");
            Console.WriteLine($"Calculate(5.5, 3.2): {Calculate(5.5, 3.2)}");
            Console.WriteLine($"Calculate(5, 3, 2): {Calculate(5, 3, 2)}");
            Console.WriteLine($"Calculate(\"Hello\", \"World\"): {Calculate("Hello", "World")}");
            Console.WriteLine();

            // --- 4. Optional and Named Arguments ---
            Console.WriteLine("--- 4. Optional and Named Arguments ---");
            RegisterUser("Alice", 30); // country uses default value "Unknown"
            RegisterUser("Bob", 25, "USA");   // country is specified
            RegisterUser(country: "Canada", username: "Charlie", age: 40); // Using named arguments
            Console.WriteLine();

            // --- 5. Expression-Bodied Members ---
            Console.WriteLine("--- 5. Expression-Bodied Members ---");
            Console.WriteLine($"Multiply(7, 6): {Multiply(7, 6)}");
            PrintMessage("This is an expression-bodied void method.");
            Console.WriteLine();

            // --- 6. ref and out Parameters ---
            Console.WriteLine("--- 6. ref and out Parameters ---");
            int myValue = 10;
            Console.WriteLine($"Original myValue: {myValue}");
            DoubleValueByRef(ref myValue); // Pass myValue by reference
            Console.WriteLine($"myValue after DoubleValueByRef: {myValue}"); // myValue is now 20
            Console.WriteLine();

            Console.WriteLine("Using 'out' parameter for TryDivide:");
            int dividend = 100;
            int divisor1 = 5;
            int divisor2 = 0;
            double divisionResult; // No need to initialize before passing as 'out'

            if (TryDivide(dividend, divisor1, out divisionResult))
            {
                Console.WriteLine($"{dividend} / {divisor1} = {divisionResult}");
            }
            else
            {
                Console.WriteLine($"Division of {dividend} by {divisor1} failed.");
            }

            if (TryDivide(dividend, divisor2, out divisionResult)) // divisionResult will be reassigned
            {
                Console.WriteLine($"{dividend} / {divisor2} = {divisionResult}");
            }
            else
            {
                Console.WriteLine($"Division of {dividend} by {divisor2} failed (divisor was zero). Result set to: {divisionResult}");
            }
            Console.WriteLine();


            Console.WriteLine("--- End of Methods Demo ---");
        }
    }
}
