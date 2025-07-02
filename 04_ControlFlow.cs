// C# Crash Course - 04_ControlFlow.cs
using System;
using System.Collections.Generic; // Required for List<T>

namespace ControlFlowDemo
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("--- C# Control Flow Demo ---");
            Console.WriteLine();

            // --- 1. if, else if, else Statements ---
            Console.WriteLine("--- 1. if, else if, else ---");
            int temperature = 22;
            if (temperature < 0)
            {
                Console.WriteLine("Freezing weather!");
            }
            else if (temperature >= 0 && temperature <= 15)
            {
                Console.WriteLine("It's cold.");
            }
            else if (temperature > 15 && temperature <= 25)
            {
                Console.WriteLine("It's mild weather.");
            }
            else
            {
                Console.WriteLine("It's warm!");
            }
            Console.WriteLine();

            // --- 2. switch Statement ---
            Console.WriteLine("--- 2. switch Statement ---");
            int dayNumber = 3;
            string dayName;

            switch (dayNumber)
            {
                case 1:
                    dayName = "Sunday";
                    break;
                case 2:
                    dayName = "Monday";
                    break;
                case 3:
                    dayName = "Tuesday";
                    break; // break is important to prevent "fall-through" to the next case
                case 4:
                    dayName = "Wednesday";
                    break;
                case 5:
                    dayName = "Thursday";
                    break;
                case 6:
                    dayName = "Friday";
                    break;
                case 7:
                    dayName = "Saturday";
                    break;
                default: // Optional: executes if no other case matches
                    dayName = "Invalid day number";
                    break;
            }
            Console.WriteLine($"Day number {dayNumber} is {dayName}.");

            // Switch with pattern matching (C# 7.0+)
            object shape = "circle"; // Could be any object
            switch (shape)
            {
                case "circle":
                    Console.WriteLine("Shape is a circle.");
                    break;
                case "square" when (dayNumber == 3): // with a condition
                    Console.WriteLine("Shape is a square, and it's Tuesday!");
                    break;
                case int i:
                    Console.WriteLine($"Shape is an integer: {i}");
                    break;
                default:
                    Console.WriteLine("Unknown shape.");
                    break;
            }
            Console.WriteLine();


            // --- 3. for Loop ---
            Console.WriteLine("--- 3. for Loop ---");
            // Prints numbers from 0 to 4
            for (int i = 0; i < 5; i++)
            {
                Console.WriteLine($"for loop iteration: {i}");
            }
            Console.WriteLine();

            // --- 4. while Loop ---
            Console.WriteLine("--- 4. while Loop ---");
            int counter = 0;
            while (counter < 3)
            {
                Console.WriteLine($"while loop counter: {counter}");
                counter++; // Important: ensure the condition eventually becomes false to avoid infinite loop
            }
            Console.WriteLine();

            // --- 5. do-while Loop ---
            Console.WriteLine("--- 5. do-while Loop ---");
            // The block executes at least once, even if the condition is initially false.
            int k = 5;
            do
            {
                Console.WriteLine($"do-while loop k: {k}"); // This line will execute
                k++;
            } while (k < 3); // Condition (5 < 3) is false, so loop terminates after first run
            Console.WriteLine($"After do-while, k is: {k}"); // k will be 6
            Console.WriteLine();

            // --- 6. foreach Loop ---
            Console.WriteLine("--- 6. foreach Loop ---");
            // Used to iterate over collections (arrays, lists, etc.)
            string[] colors = { "Red", "Green", "Blue" };
            Console.WriteLine("Iterating through an array of colors:");
            foreach (string color in colors)
            {
                Console.WriteLine(color);
            }
            Console.WriteLine();

            List<int> numbers = new List<int> { 10, 20, 30, 40 };
            Console.WriteLine("Iterating through a list of numbers:");
            foreach (int num in numbers)
            {
                Console.WriteLine(num);
            }
            Console.WriteLine();

            // --- 7. break Statement ---
            Console.WriteLine("--- 7. break Statement ---");
            // Exits a loop prematurely
            for (int i = 0; i < 10; i++)
            {
                if (i == 3)
                {
                    Console.WriteLine("Breaking loop at i = 3");
                    break; // Loop terminates
                }
                Console.WriteLine($"break example, i = {i}");
            }
            Console.WriteLine();

            // --- 8. continue Statement ---
            Console.WriteLine("--- 8. continue Statement ---");
            // Skips the current iteration and proceeds to the next
            for (int i = 0; i < 5; i++)
            {
                if (i == 2)
                {
                    Console.WriteLine("Skipping iteration where i = 2 (using continue)");
                    continue; // Skips the Console.WriteLine below for this iteration
                }
                Console.WriteLine($"continue example, i = {i}");
            }
            Console.WriteLine();

            Console.WriteLine("--- End of Control Flow Demo ---");
        }
    }
}
