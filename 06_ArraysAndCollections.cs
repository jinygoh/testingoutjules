// C# Crash Course - 06_ArraysAndCollections.cs
using System;
using System.Collections.Generic; // Required for List<T>, Dictionary<TKey, TValue>, etc.
using System.Linq; // Required for some convenient methods like .ToList() or .ToArray() if used.

namespace ArraysAndCollectionsDemo
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("--- C# Arrays and Collections Demo ---");
            Console.WriteLine();

            // --- 1. Arrays ---
            Console.WriteLine("--- 1. Arrays ---");

            // Declaration and Initialization
            int[] numbers = new int[5]; // Creates an array of 5 integers, initialized to 0
            numbers[0] = 10;
            numbers[1] = 20;
            numbers[2] = 30;
            numbers[3] = 40;
            numbers[4] = 50;
            // numbers[5] = 60; // This would cause an IndexOutOfRangeException

            Console.WriteLine("Numbers array elements:");
            for (int i = 0; i < numbers.Length; i++)
            {
                Console.WriteLine($"numbers[{i}] = {numbers[i]}");
            }
            Console.WriteLine();

            // Shorthand initialization
            string[] fruits = { "Apple", "Banana", "Cherry", "Date" };
            Console.WriteLine("Fruits array elements (using foreach):");
            foreach (string fruit in fruits)
            {
                Console.WriteLine(fruit);
            }
            Console.WriteLine($"Number of fruits: {fruits.Length}");
            Console.WriteLine();

            // Array methods
            Array.Sort(fruits); // Sorts the array alphabetically
            Console.WriteLine("Fruits array after sorting:");
            foreach (string fruit in fruits)
            {
                Console.WriteLine(fruit);
            }
            int cherryIndex = Array.IndexOf(fruits, "Cherry");
            Console.WriteLine($"Index of 'Cherry' after sort: {cherryIndex}");
            Console.WriteLine();


            // --- 2. Multi-dimensional Arrays ---
            Console.WriteLine("--- 2. Multi-dimensional Arrays ---");

            // Two-dimensional (Rectangular) Array
            int[,] matrix = {
                {1, 2, 3},
                {4, 5, 6},
                {7, 8, 9}
            };
            Console.WriteLine("Matrix elements (2D Array):");
            for (int i = 0; i < matrix.GetLength(0); i++) // GetLength(0) for rows
            {
                for (int j = 0; j < matrix.GetLength(1); j++) // GetLength(1) for columns
                {
                    Console.Write(matrix[i, j] + "\t");
                }
                Console.WriteLine();
            }
            Console.WriteLine($"Element at matrix[1,1]: {matrix[1, 1]}"); // Accesses 5
            Console.WriteLine();

            // Jagged Array (Array of Arrays)
            int[][] jaggedArray = new int[3][];
            jaggedArray[0] = new int[] { 10, 20 };
            jaggedArray[1] = new int[] { 30, 40, 50, 60 };
            jaggedArray[2] = new int[] { 70, 80, 90 };

            Console.WriteLine("Jagged Array elements:");
            for (int i = 0; i < jaggedArray.Length; i++)
            {
                Console.Write($"Row {i}: ");
                for (int j = 0; j < jaggedArray[i].Length; j++)
                {
                    Console.Write(jaggedArray[i][j] + " ");
                }
                Console.WriteLine();
            }
            Console.WriteLine($"Element at jaggedArray[1][2]: {jaggedArray[1][2]}"); // Accesses 50
            Console.WriteLine();


            // --- 3. Generic Collections ---
            Console.WriteLine("--- 3. Generic Collections (List<T> and Dictionary<TKey, TValue>) ---");

            // List<T> - Dynamically resizable list
            Console.WriteLine("-- List<string> --");
            List<string> names = new List<string>();
            names.Add("Alice");
            names.Add("Bob");
            names.Add("Charlie");
            names.Insert(1, "Zack"); // Insert Zack at index 1

            Console.WriteLine("Names in the list:");
            foreach (string name in names)
            {
                Console.WriteLine(name);
            }
            Console.WriteLine($"Count of names: {names.Count}");

            names.Remove("Bob");
            names.RemoveAt(0); // Removes "Alice"

            Console.WriteLine("Names after removals:");
            foreach (string name in names)
            {
                Console.WriteLine(name);
            }
            Console.WriteLine($"Contains 'Charlie'? {names.Contains("Charlie")}");
            Console.WriteLine();

            // List<int> with initializer
            List<int> scores = new List<int> { 95, 88, 72, 100, 88 };
            scores.Sort(); // Sorts in ascending order
            Console.WriteLine("Sorted scores:");
            foreach (int score in scores)
            {
                Console.WriteLine(score);
            }
            Console.WriteLine();


            // Dictionary<TKey, TValue> - Key-value pairs
            Console.WriteLine("-- Dictionary<string, int> --");
            Dictionary<string, int> studentAges = new Dictionary<string, int>();
            studentAges.Add("David", 22);
            studentAges["Eve"] = 21; // Another way to add or update
            studentAges["Frank"] = 23;

            if (studentAges.ContainsKey("David"))
            {
                Console.WriteLine($"David's age: {studentAges["David"]}");
            }

            studentAges["Eve"] = 22; // Update Eve's age

            Console.WriteLine("Student ages in dictionary:");
            foreach (KeyValuePair<string, int> student in studentAges)
            {
                Console.WriteLine($"{student.Key} is {student.Value} years old.");
            }

            // TryGetValue is a safer way to get values
            if (studentAges.TryGetValue("Grace", out int graceAge))
            {
                Console.WriteLine($"Grace's age: {graceAge}");
            }
            else
            {
                Console.WriteLine("Grace is not in the dictionary.");
            }

            studentAges.Remove("Frank");
            Console.WriteLine($"Number of students after removing Frank: {studentAges.Count}");
            Console.WriteLine();

            // Other Collections (brief mention)
            Console.WriteLine("-- Other Collections (Queue, Stack, HashSet) --");
            // Queue<T> (FIFO)
            Queue<string> taskQueue = new Queue<string>();
            taskQueue.Enqueue("Task 1");
            taskQueue.Enqueue("Task 2");
            Console.WriteLine($"Dequeued: {taskQueue.Dequeue()}"); // Task 1

            // Stack<T> (LIFO)
            Stack<string> pageHistory = new Stack<string>();
            pageHistory.Push("Page A");
            pageHistory.Push("Page B");
            Console.WriteLine($"Popped: {pageHistory.Pop()}"); // Page B

            // HashSet<T> (Unique items, unordered)
            HashSet<int> uniqueNumbers = new HashSet<int> { 1, 2, 2, 3, 4, 4, 4, 5 };
            Console.Write("Unique numbers in HashSet: ");
            foreach (int num in uniqueNumbers)
            {
                Console.Write(num + " "); // Output: 1 2 3 4 5 (order may vary)
            }
            Console.WriteLine();
            Console.WriteLine();

            Console.WriteLine("--- End of Arrays and Collections Demo ---");
        }
    }
}
