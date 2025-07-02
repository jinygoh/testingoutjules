// C# Crash Course - 03_Operators.cs
using System;

namespace OperatorsDemo
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("--- C# Operators Demo ---");
            Console.WriteLine();

            // --- 1. Arithmetic Operators ---
            Console.WriteLine("--- 1. Arithmetic Operators ---");
            int a = 10;
            int b = 3;
            int sum = a + b;        // Addition
            int difference = a - b; // Subtraction
            int product = a * b;    // Multiplication
            int quotient = a / b;   // Division (integer division, result is 3)
            int remainder = a % b;  // Modulus (remainder is 1)

            Console.WriteLine($"a = {a}, b = {b}");
            Console.WriteLine($"Sum (a + b): {sum}");
            Console.WriteLine($"Difference (a - b): {difference}");
            Console.WriteLine($"Product (a * b): {product}");
            Console.WriteLine($"Quotient (a / b): {quotient}");     // Integer division
            Console.WriteLine($"Remainder (a % b): {remainder}");

            double c = 10.0;
            double d = 3.0;
            double doubleQuotient = c / d; // Floating-point division
            Console.WriteLine($"Double Quotient (c / d): {doubleQuotient}");
            Console.WriteLine();

            // Increment and Decrement
            int x = 5;
            Console.WriteLine($"Initial x: {x}");
            x++; // Postfix increment (x becomes 6, expression value is 5)
            Console.WriteLine($"After x++: {x}");
            ++x; // Prefix increment (x becomes 7, expression value is 7)
            Console.WriteLine($"After ++x: {x}");

            int y = 8;
            Console.WriteLine($"Initial y: {y}");
            y--; // Postfix decrement
            Console.WriteLine($"After y--: {y}");
            --y; // Prefix decrement
            Console.WriteLine($"After --y: {y}");
            Console.WriteLine();

            // --- 2. Comparison (Relational) Operators ---
            Console.WriteLine("--- 2. Comparison Operators ---");
            int val1 = 10;
            int val2 = 20;
            Console.WriteLine($"val1 = {val1}, val2 = {val2}");
            Console.WriteLine($"val1 == val2: {val1 == val2}"); // Equal to (false)
            Console.WriteLine($"val1 != val2: {val1 != val2}"); // Not equal to (true)
            Console.WriteLine($"val1 > val2: {val1 > val2}");   // Greater than (false)
            Console.WriteLine($"val1 < val2: {val1 < val2}");   // Less than (true)
            Console.WriteLine($"val1 >= 10: {val1 >= 10}"); // Greater than or equal to (true)
            Console.WriteLine($"val2 <= 15: {val2 <= 15}"); // Less than or equal to (false)
            Console.WriteLine();

            // --- 3. Logical Operators ---
            Console.WriteLine("--- 3. Logical Operators ---");
            bool condition1 = true;
            bool condition2 = false;
            Console.WriteLine($"condition1 = {condition1}, condition2 = {condition2}");
            Console.WriteLine($"condition1 && condition2 (AND): {condition1 && condition2}"); // Logical AND (false)
            Console.WriteLine($"condition1 || condition2 (OR): {condition1 || condition2}");   // Logical OR (true)
            Console.WriteLine($"!condition1 (NOT): {!condition1}");                         // Logical NOT (false)
            Console.WriteLine();

            // Example combining comparison and logical operators
            int age = 25;
            bool hasLicense = true;
            bool canDrive = age >= 18 && hasLicense;
            Console.WriteLine($"Age: {age}, Has License: {hasLicense}, Can Drive: {canDrive}");
            Console.WriteLine();

            // --- 4. Assignment Operators ---
            Console.WriteLine("--- 4. Assignment Operators ---");
            int num = 100;
            Console.WriteLine($"Initial num: {num}");

            num += 20; // num = num + 20;
            Console.WriteLine($"After num += 20: {num}"); // 120

            num -= 30; // num = num - 30;
            Console.WriteLine($"After num -= 30: {num}"); // 90

            num *= 2;  // num = num * 2;
            Console.WriteLine($"After num *= 2: {num}");  // 180

            num /= 3;  // num = num / 3;
            Console.WriteLine($"After num /= 3: {num}");  // 60

            num %= 7;  // num = num % 7; (60 % 7 = 4)
            Console.WriteLine($"After num %= 7: {num}");   // 4
            Console.WriteLine();

            // --- 5. Ternary Operator (Conditional Operator) ---
            Console.WriteLine("--- 5. Ternary Operator ---");
            int temperature = 15;
            string weather = temperature > 20 ? "Warm" : "Cool";
            Console.WriteLine($"Temperature: {temperature}°C, Weather is: {weather}");

            int points = 75;
            string resultMessage = points >= 50 ? "Pass" : "Fail";
            Console.WriteLine($"Points: {points}, Result: {resultMessage}");
            Console.WriteLine();

            // --- 6. Null-Coalescing Operators ---
            Console.WriteLine("--- 6. Null-Coalescing Operators ---");
            string? nullableName = null;
            string displayName = nullableName ?? "Guest"; // If nullableName is null, use "Guest"
            Console.WriteLine($"DisplayName (from null): {displayName}");

            nullableName = "Alice";
            displayName = nullableName ?? "Guest"; // If nullableName is null, use "Guest"
            Console.WriteLine($"DisplayName (from 'Alice'): {displayName}");

            // Null-coalescing assignment operator (??=)
            // Assigns the value only if the variable is currently null.
            string? configValue = null;
            Console.WriteLine($"Initial configValue: {configValue ?? "null"}");
            configValue ??= "DefaultSetting"; // configValue is null, so it's assigned "DefaultSetting"
            Console.WriteLine($"configValue after ??= 'DefaultSetting': {configValue}");

            configValue = "UserSet";
            Console.WriteLine($"configValue is now: {configValue}");
            configValue ??= "AnotherDefault"; // configValue is not null, so it remains "UserSet"
            Console.WriteLine($"configValue after ??= 'AnotherDefault' (no change): {configValue}");
            Console.WriteLine();

            // --- Operator Precedence ---
            Console.WriteLine("--- Operator Precedence ---");
            int calc = 10 + 5 * 2; // Multiplication (5 * 2) happens before addition
            Console.WriteLine($"10 + 5 * 2 = {calc}"); // Expected: 20 (10 + 10)

            int calcWithParentheses = (10 + 5) * 2; // Addition (10 + 5) happens first due to parentheses
            Console.WriteLine($"(10 + 5) * 2 = {calcWithParentheses}"); // Expected: 30 (15 * 2)
            Console.WriteLine();

            Console.WriteLine("--- End of Operators Demo ---");
        }
    }
}
