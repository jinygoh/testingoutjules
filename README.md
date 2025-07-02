# C# Crash Course for ASP.NET Beginners

Welcome to the C# Crash Course! This guide is designed to quickly get you up to speed with the C# programming language features most relevant for starting your journey with ASP.NET development.

Each section includes explanations and refers to corresponding C# example files (`.cs`) that you can compile and run.

## Table of Contents

1.  [Introduction to C#](#1-introduction-to-c)
2.  [Setting up the Environment](#2-setting-up-the-environment)
3.  [Basic Syntax and Data Types](#3-basic-syntax-and-data-types)
4.  [Operators](#4-operators)
5.  [Control Flow](#5-control-flow)
6.  [Methods (Functions)](#6-methods-functions)
7.  [Arrays and Collections](#7-arrays-and-collections)
8.  [Object-Oriented Programming (OOP) Basics](#8-object-oriented-programming-oop-basics)
9.  [Error Handling (Exception Handling)](#9-error-handling-exception-handling)
10. [LINQ (Language Integrated Query) Basics](#10-linq-language-integrated-query-basics)
11. [Async/Await (Brief Introduction)](#11-asyncawait-brief-introduction)
12. [File I/O (Simple Example)](#12-file-io-simple-example)
13. [Next Steps: C# to ASP.NET](#13-next-steps-c-to-aspnet)

---

## 1. Introduction to C#

C# (pronounced "C sharp") is a modern, object-oriented, and type-safe programming language developed by Microsoft. It runs on the .NET Framework (and its cross-platform successor, .NET Core / .NET 5+), which provides a large class library and supports multiple programming languages.

**Key Characteristics of C#:**

*   **Object-Oriented:** C# is fundamentally object-oriented, supporting encapsulation, inheritance, and polymorphism. This helps in building modular, reusable, and maintainable code.
*   **Type-Safe:** C# enforces type safety, which means that the language prevents operations that could lead to undefined behavior due to type mismatches. This helps catch errors early in the development process.
*   **Versatile:** While initially designed for Windows desktop applications, C# is now used for a wide range of applications, including:
    *   **Web Development:** This is a primary use case, especially with ASP.NET and ASP.NET Core, for building dynamic websites, web applications, and web services (APIs).
    *   **Game Development:** Popular game engines like Unity use C# as their primary scripting language.
    *   **Mobile Applications:** Using frameworks like Xamarin (now part of .NET MAUI), C# can be used to build cross-platform mobile apps for iOS and Android.
    *   **Desktop Applications:** For Windows Presentation Foundation (WPF), Windows Forms, and Universal Windows Platform (UWP) apps.
    *   **Cloud Computing:** Building applications deployed on cloud platforms like Microsoft Azure.
    *   **Internet of Things (IoT):** Developing software for IoT devices.
*   **Modern Language Features:** C# incorporates many modern programming features like LINQ (Language Integrated Query), asynchronous programming (`async`/`await`), lambda expressions, generics, and more, which make development more productive and code more expressive.
*   **Part of the .NET Ecosystem:** C# is deeply integrated with the .NET ecosystem.
    *   **.NET Framework:** The original framework primarily for Windows.
    *   **.NET (formerly .NET Core):** The cross-platform (Windows, macOS, Linux), open-source successor. This is what modern ASP.NET applications are built on.
    *   **Common Language Runtime (CLR):** Manages the execution of .NET programs. It handles memory management (garbage collection), security, and exception handling.
    *   **Base Class Library (BCL) / Framework Class Library (FCL):** A comprehensive library of pre-written code for common tasks like file I/O, string manipulation, network communication, data access, etc.

**C# and ASP.NET:**

ASP.NET is a framework for building web applications and services using .NET and C#. When you learn C#, you're learning the core language that powers ASP.NET.
*   In ASP.NET, C# is used to write the logic for your web pages (e.g., in Razor Pages or MVC Controllers), define data models, interact with databases, and implement business rules.
*   Understanding C# concepts like classes, methods, asynchronous programming, and LINQ is essential for effective ASP.NET development.

This crash course will focus on the fundamental C# concepts you'll need to get started with ASP.NET.

---

## 2. Setting up the Environment

To start writing and running C# code, you need to set up a development environment.

**1. .NET SDK (Software Development Kit)**

The .NET SDK is essential. It includes everything you need to build and run .NET applications, including the command-line interface (CLI), the .NET runtime, and libraries.

*   **Download:** You can download the latest .NET SDK from the official Microsoft website: [https://dotnet.microsoft.com/download](https://dotnet.microsoft.com/download)
*   **Installation:** Follow the installation instructions for your operating system (Windows, macOS, or Linux).
*   **Verification:** After installation, open a terminal or command prompt and type:
    ```bash
    dotnet --version
    ```
    This should display the installed .NET SDK version.

**2. Integrated Development Environment (IDE)**

While you can use any text editor with the .NET SDK, an IDE provides a much richer development experience with features like code completion, debugging, and project management.

*   **Visual Studio (Windows):**
    *   This is the most comprehensive IDE for .NET development.
    *   Download Visual Studio Community edition (free for individual developers, open-source projects, and small teams) from [https://visualstudio.microsoft.com/vs/](https://visualstudio.microsoft.com/vs/).
    *   During installation, make sure to select the ".NET desktop development" workload for console applications and the "ASP.NET and web development" workload if you plan to move to ASP.NET soon.

*   **Visual Studio Code (Cross-platform: Windows, macOS, Linux):**
    *   A lightweight, powerful, and free source code editor with excellent C# support through extensions.
    *   Download from [https://code.visualstudio.com/](https://code.visualstudio.com/).
    *   Install the "C# for Visual Studio Code (powered by OmniSharp)" extension from the Extensions Marketplace within VS Code.

*   **JetBrains Rider (Cross-platform: Windows, macOS, Linux):**
    *   A powerful, commercial IDE from JetBrains, known for its intelligent features. It has a paid license but offers a free trial.

**Creating Your First Console Application (using .NET CLI)**

For the examples in this crash course, we'll primarily use simple console applications. Here's how you can create one using the .NET CLI:

1.  **Open your terminal or command prompt.**
2.  **Navigate to a folder where you want to create your project:**
    ```bash
    cd path/to/your/projects
    ```
3.  **Create a new console application:**
    ```bash
    dotnet new console -o MyCSharpApp
    ```
    *   `dotnet new console` is the command to create a new console project.
    *   `-o MyCSharpApp` specifies that the project should be created in a new directory named `MyCSharpApp`.

4.  **Navigate into the project directory:**
    ```bash
    cd MyCSharpApp
    ```
    You'll find a few files, including `Program.cs` (which contains the entry point of your application) and `MyCSharpApp.csproj` (the project file). The example `.cs` files from this course can be placed in this project, and you can modify `Program.cs` to call into them or copy their contents into `Program.cs` to run them.

5.  **Run the application:**
    ```bash
    dotnet run
    ```
    This will compile and run your application.

For this crash course, we provide code snippets that you can place inside the `Program.cs` file of a console application, or you can copy the entire content of one of the provided `.cs` files (e.g., `02_BasicSyntax.cs`) into your `Program.cs` to run that specific demo.

---

## 3. Basic Syntax and Data Types

C# syntax is similar to that of C++, Java, and JavaScript.

*   **Case Sensitivity:** C# is case-sensitive. `myVariable` and `MyVariable` would be treated as two different variables.
*   **Statements and Semicolons:** Every statement in C# must end with a semicolon (`;`).
*   **Code Blocks:** Code blocks are defined by curly braces `{}`. They are used for classes, methods, `if` statements, loops, etc.
*   **Comments:**
    *   Single-line comments start with `//`.
    *   Multi-line comments start with `/*` and end with `*/`.
    *   XML documentation comments start with `///` and are used to generate documentation.
*   **`using` Directive:** The `using` directive imports namespaces, allowing you to use types defined in those namespaces without specifying their full name. For example, `using System;` allows you to use `Console.WriteLine()` instead of `System.Console.WriteLine()`.
*   **`Main` Method:** The entry point of a C# console application is the `Main` method.
    ```csharp
    class Program
    {
        static void Main(string[] args)
        {
            // Your code starts here
        }
    }
    ```
    Recent C# versions allow for "top-level statements," where you can write code directly in `Program.cs` without explicitly defining the `Program` class and `Main` method for simple programs. However, understanding the traditional structure is important.

**Variables and Data Types:**
Variables are used to store data. In C#, you must declare a variable's type before you can use it. Syntax: `dataType variableName = value;`

**Common Data Types:**
*   **Integers:** `int`, `long`, `short`, `byte`
*   **Floating-Point Numbers:** `float` (suffix `f` or `F`), `double` (default), `decimal` (suffix `m` or `M`, for high precision)
*   **Character:** `char` (single quotes, e.g., `'A'`)
*   **Boolean:** `bool` (`true` or `false`)
*   **String:** `string` (double quotes, e.g., `"Hello"`)
*   **Object:** `object` (base type for all other types)

**Type Inference with `var`:**
Use `var` to let the compiler infer the type from the initialization. `var count = 10; // int`
The type is still statically determined at compile time and cannot be changed.

**Constants:**
Values that cannot be changed after definition. `const double PI = 3.14159;`

**Nullable Value Types:**
Value types (like `int`, `bool`, `struct`) cannot normally be `null`. To allow them to hold `null`, use `?`.
`int? nullableAge = null;`
Check with `nullableAge.HasValue` and access with `nullableAge.Value`.
The null-coalescing operator `??` provides a default if a nullable type is null: `int age = nullableAge ?? 25;`

**Example Code:**
See `02_BasicSyntax.cs` for detailed examples of "Hello World", comments, various data types, `var`, constants, and nullable types.

```csharp
// Partial example from 02_BasicSyntax.cs
using System;

namespace BasicSyntaxDemo
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Hello, World!");

            int age = 30;
            string name = "Jules";
            bool isActive = true;
            decimal price = 19.99m;
            var message = "This is a message."; // Inferred as string

            Console.WriteLine($"Name: {name}, Age: {age}, Active: {isActive}, Price: {price:C}");
            Console.WriteLine(message);

            int? middleInitialCount = null;
            if (middleInitialCount.HasValue) {
                Console.WriteLine($"Middle Initial Count: {middleInitialCount.Value}");
            } else {
                Console.WriteLine("No middle initial count.");
            }
        }
    }
}
```

---

## 4. Operators

C# provides operators for various operations.

**1. Arithmetic Operators:** `+`, `-`, `*`, `/` (division), `%` (modulus), `++` (increment), `--` (decrement).
**2. Comparison (Relational) Operators:** `==` (equal to), `!=` (not equal to), `>`, `<`, `>=`, `<=`. Return `bool`.
**3. Logical Operators:** `&&` (logical AND), `||` (logical OR), `!` (logical NOT).
**4. Assignment Operators:** `=`, `+=`, `-=`, `*=`, `/=`, `%=`.
**5. Ternary Operator:** `condition ? expressionIfTrue : expressionIfFalse;`
**6. Null-Coalescing Operators:**
    *   `??` : `result = possiblyNullValue ?? defaultValue;`
    *   `??=`: `myVariable ??= defaultValueIfNotAlreadySet;`

**Operator Precedence:**
C# follows a defined order of operations (e.g., `*` and `/` before `+` and `-`). Use parentheses `()` to control evaluation order explicitly.

**Example Code:**
See `03_Operators.cs` for examples of all these operators.

```csharp
// Partial example from 03_Operators.cs
int a = 10, b = 4;
Console.WriteLine($"Addition: {a + b}");       // 14
Console.WriteLine($"Division: {a / b}");       // 2 (integer division)
Console.WriteLine($"Modulus: {a % b}");        // 2

bool isGreater = a > b; // true
bool check = (a > 0) && (b > 0); // true

int score = 75;
string result = score >= 50 ? "Pass" : "Fail"; // Pass

string? userName = null;
string displayName = userName ?? "Guest"; // Guest
```

---

## 5. Control Flow

Statements to control the order of execution.

**1. `if`, `else if`, `else` Statements:** Conditional execution.
**2. `switch` Statement:** Selects one of many code blocks to be executed based on a value. Uses `case` and `break`. `default` is optional. C# 7+ supports pattern matching in `switch`.
**3. `for` Loop:** `for (initializer; condition; iterator) { ... }`
**4. `while` Loop:** `while (condition) { ... }` Condition checked before execution.
**5. `do-while` Loop:** `do { ... } while (condition);` Condition checked after execution (always runs at least once).
**6. `foreach` Loop:** `foreach (var item in collection) { ... }` Iterates over elements in a collection (array, list, etc.).
**7. `break` Statement:** Exits the innermost loop or `switch`.
**8. `continue` Statement:** Skips the current iteration of a loop and proceeds to the next.

**Example Code:**
See `04_ControlFlow.cs` for examples of all these control flow statements.

```csharp
// Partial example from 04_ControlFlow.cs
int number = 7;
if (number % 2 == 0) {
    Console.WriteLine("Even");
} else {
    Console.WriteLine("Odd");
}

for (int i = 0; i < 3; i++) {
    Console.WriteLine($"For loop i: {i}");
}

string[] colors = { "Red", "Green", "Blue" };
foreach (var color in colors) {
    if (color == "Green") continue; // Skip Green
    Console.WriteLine(color);
    if (color == "Blue") break; // Stop after Blue
}
```

---

## 6. Methods (Functions)

Blocks of code that perform specific tasks, promoting reusability and organization.

**Definition Syntax:**
`<access_modifier> <static?> <return_type> MethodName(<parameters?>) { ... }`
*   `return_type`: `void` if no value is returned.
*   `static`: Method belongs to the class, not an instance.

**Method Overloading:** Same method name, different parameter lists (number or types of parameters).
**Optional Parameters:** Provide default values: `void MyMethod(int x, string y = "default") { ... }`
**Named Arguments:** Call methods specifying parameter names: `MyMethod(x: 5, y: "custom");`
**Expression-Bodied Members (C# 6+):** Concise syntax for single-expression methods: `public int Add(int a, int b) => a + b;`
**`ref` and `out` Parameters:**
*   `ref`: Pass by reference (variable must be initialized). Changes in method affect original.
*   `out`: Pass by reference (variable need not be initialized). Method *must* assign to it. Useful for returning multiple values.

**Example Code:**
See `05_Methods.cs` for detailed examples.

```csharp
// Partial example from 05_Methods.cs
public static class MathUtils
{
    public static int Add(int a, int b) => a + b; // Expression-bodied

    public static void Greet(string name, string prefix = "Mr./Ms.")
    {
        Console.WriteLine($"Hello, {prefix} {name}!");
    }

    public static bool TryParseInt(string s, out int result)
    {
        return int.TryParse(s, out result); // int.TryParse uses an out parameter
    }
}

// Calling:
Console.WriteLine(MathUtils.Add(5, 3)); // 8
MathUtils.Greet("Smith"); // Hello, Mr./Ms. Smith!
MathUtils.Greet(prefix: "Dr.", name: "Jones"); // Hello, Dr. Jones!

if (MathUtils.TryParseInt("123", out int parsedValue)) {
    Console.WriteLine($"Parsed: {parsedValue}");
}
```

---

## 7. Arrays and Collections

Storing groups of related objects.

**1. Arrays:** Fixed-size, same-type elements. Zero-based index.
   `int[] numbers = new int[5];`
   `string[] names = { "Al", "Bo", "Cy" };`
   `numbers[0] = 10;`
   `Length` property for size.

**2. Multi-dimensional Arrays:**
   *   Rectangular: `int[,] matrix = new int[3, 4];`
   *   Jagged (array of arrays): `int[][] jagged = new int[3][]; jagged[0] = new int[2];`

**3. Generic Collections (`System.Collections.Generic`):** Flexible, type-safe.
   *   **`List<T>`:** Dynamically resizable. `Add()`, `Remove()`, `RemoveAt()`, `Count`, index access `[]`.
     `List<string> items = new List<string>(); items.Add("Apple");`
   *   **`Dictionary<TKey, TValue>`:** Key-value pairs. Keys unique. `Add(key, value)`, `Remove(key)`, `ContainsKey(key)`, `TryGetValue(key, out value)`, index access `[]`.
     `Dictionary<string, int> ages = new Dictionary<string, int>(); ages["Bob"] = 30;`
   *   Others: `Queue<T>` (FIFO), `Stack<T>` (LIFO), `HashSet<T>` (unique items).

**Example Code:**
See `06_ArraysAndCollections.cs` for examples.

```csharp
// Partial example from 06_ArraysAndCollections.cs
List<string> fruits = new List<string> { "Apple", "Banana" };
fruits.Add("Cherry");
Console.WriteLine($"First fruit: {fruits[0]}"); // Apple
Console.WriteLine($"Number of fruits: {fruits.Count}"); // 3

Dictionary<int, string> errorCodes = new Dictionary<int, string>
{
    { 404, "Not Found" },
    { 500, "Internal Server Error" }
};
if (errorCodes.TryGetValue(404, out string message))
{
    Console.WriteLine($"Error 404: {message}");
}
```

---

## 8. Object-Oriented Programming (OOP) Basics

Paradigm based on "objects" containing data (fields/properties) and code (methods).

**1. Classes and Objects:**
   *   **Class:** Blueprint (e.g., `public class Person { ... }`).
   *   **Object:** Instance of a class (`Person p = new Person();`).
   *   **Fields:** Variables within a class (usually `private`).
   *   **Properties:** Controlled access to fields (getters/setters). `public string Name { get; set; }` (auto-property).
   *   **Constructors:** Special methods for object creation (same name as class). `public Person(string name) { Name = name; }`.
   *   **`this` keyword:** Refers to the current instance.
   *   **`static` members:** Belong to the class, not instances. `public static int Count;`

**2. Encapsulation:** Bundling data and methods. Data hiding via access modifiers:
   `public`, `private`, `protected`, `internal`.

**3. Inheritance:** A class (derived/child) inherits from another class (base/parent). Promotes reuse.
   `public class Student : Person { ... }`
   `base` keyword: Access base class members. `public Student(string name) : base(name) { ... }`

**4. Polymorphism ("Many Forms"):** Objects treated as instances of their base class.
   Achieved via `virtual` methods in base class and `override` methods in derived class.
   `public virtual void DisplayInfo() { ... }` (in `Person`)
   `public override void DisplayInfo() { ... }` (in `Student`)
   `Person p = new Student(); p.DisplayInfo(); // Calls Student's version`

**5. Abstraction:** Hiding complexity, showing essentials.
   *   **Abstract Classes:** Cannot be instantiated. Can have `abstract` methods (no body, must be implemented by non-abstract derived classes).
     `public abstract class Shape { public abstract double Area(); }`
   *   **Interfaces:** Define a contract (methods, properties signatures). A class can implement multiple interfaces.
     `public interface IDrawable { void Draw(); }`
     `public class Button : IDrawable { public void Draw() { ... } }`

**Example Code:**
See `07_OOP.cs` for comprehensive examples of all these OOP concepts.

```csharp
// Partial example from 07_OOP.cs
public class Animal
{
    public string Name { get; set; }
    public Animal(string name) { Name = name; }
    public virtual void MakeSound() { Console.WriteLine("Generic sound"); }
}

public class Dog : Animal
{
    public Dog(string name) : base(name) { }
    public override void MakeSound() { Console.WriteLine("Woof!"); }
}

// Usage:
Animal myPet = new Dog("Buddy");
myPet.MakeSound(); // Woof!
```

---

## 9. Error Handling (Exception Handling)

Managing errors during program execution.

**`try-catch-finally` Blocks:**
*   `try`: Code that might throw an exception.
*   `catch (ExceptionType ex)`: Handles specific exceptions. `ex` object has error details (e.g., `ex.Message`, `ex.StackTrace`). Catch specific exceptions before general `Exception`.
*   `finally`: Code that always executes (whether exception occurred or not). For cleanup (e.g., closing files).

**Throwing Exceptions:** `throw new ExceptionType("Error message");`
   Used when an error condition is met.

**Common Exception Types:** `NullReferenceException`, `IndexOutOfRangeException`, `FormatException`, `IOException`, `ArgumentException`, `DivideByZeroException`, `InvalidOperationException`.

**Custom Exceptions:** Inherit from `Exception` or other specific exception classes for application-specific errors.
   `public class MyCustomException : Exception { ... }`

**Best Practices:**
*   Catch only exceptions you can handle meaningfully.
*   Use `finally` or `using` statement for resource cleanup.
*   Throw specific exceptions.
*   Don't use exceptions for normal control flow. Log details.

**Example Code:**
See `08_ExceptionHandling.cs` for examples.

```csharp
// Partial example from 08_ExceptionHandling.cs
try
{
    int x = 10;
    int y = 0;
    // int result = x / y; // Throws DivideByZeroException
    string s = "abc";
    int num = int.Parse(s); // Throws FormatException if s is not a valid number
}
catch (DivideByZeroException dzEx)
{
    Console.WriteLine("Error: Cannot divide by zero. " + dzEx.Message);
}
catch (FormatException fEx)
{
    Console.WriteLine("Error: Invalid format. " + fEx.Message);
}
catch (Exception ex) // General handler
{
    Console.WriteLine("An unexpected error occurred: " + ex.Message);
}
finally
{
    Console.WriteLine("Finally block always runs.");
}
```

---

## 10. LINQ (Language Integrated Query) Basics

Consistent way to query data from various sources (collections, databases, XML). `using System.Linq;`

**Key Concepts:**
*   **Query Syntax:** SQL-like (`from item in collection where ... select ...`).
*   **Method Syntax (Fluent):** Uses extension methods (`collection.Where(...).Select(...)`). Often preferred.
*   **Deferred Execution:** Queries often execute only when results are iterated or materialized (e.g., by `ToList()`).

**Common LINQ Operations (Method Syntax):**
*   **`Where(predicate)`:** Filters based on a condition (lambda expression `item => item.Property > value`).
*   **`Select(transform)`:** Projects each element to a new form (`item => item.Name` or `item => new { Id = item.Id, Name = item.Name }`).
*   **`OrderBy(keySelector)` / `OrderByDescending(keySelector)`:** Sorts.
*   **`ThenBy(keySelector)` / `ThenByDescending(keySelector)`:** Secondary sort.
*   **`First(predicate?)` / `FirstOrDefault(predicate?)`:** Gets first element (or default). `First` throws if not found.
*   **`Single(predicate?)` / `SingleOrDefault(predicate?)`:** Gets the only element (or default). Throws if not exactly one (or zero for `OrDefault`).
*   **`Any(predicate?)`:** Checks if any element exists/matches. Returns `bool`.
*   **`All(predicate)`:** Checks if all elements match. Returns `bool`.
*   **`Count(predicate?)`:** Gets number of elements.
*   **`Sum()`, `Average()`, `Min()`, `Max()`:** Aggregation.
*   **`ToList()`, `ToArray()`:** Materializes query results.
*   **`GroupBy(keySelector)`:** Groups elements by a key.

**Example Code:**
See `09_LINQ.cs` for examples using a `List<Product>`.

```csharp
// Partial example from 09_LINQ.cs
List<int> numbers = new List<int> { 1, 2, 3, 4, 5, 6 };
var evenNumbers = numbers.Where(n => n % 2 == 0).ToList(); // { 2, 4, 6 }
var squares = numbers.Select(n => n * n).ToList(); // { 1, 4, 9, 16, 25, 36 }

List<Product> products = GetSampleProducts(); // Assume this method exists
var cheapElectronics = products
    .Where(p => p.Category == "Electronics" && p.Price < 100)
    .OrderBy(p => p.Name)
    .Select(p => new { p.Name, p.Price })
    .ToList();
```

---

## 11. Async/Await (Brief Introduction)

For responsive and scalable applications, especially with I/O-bound operations (network, database, file access). `using System.Threading.Tasks;`

**Why?** Prevents UI freezing, improves server scalability by not blocking threads.

**Key Concepts:**
*   **`async` Modifier:** Indicates a method may contain `await`. Allows `await` usage.
    *   Return types: `Task` (no result), `Task<TResult>` (returns `TResult`), or `void` (avoid except for event handlers).
*   **`await` Operator:** Asynchronously waits for a `Task` to complete.
    *   Control returns to caller while awaiting. Thread is not blocked.
    *   Execution resumes after `await` when task completes.
    *   `await task` evaluates to `TResult` if `task` is `Task<TResult>`.

**Basic Pattern:**
```csharp
public async Task<string> FetchDataAsync()
{
    Console.WriteLine("Starting fetch...");
    await Task.Delay(2000); // Simulate non-blocking I/O delay
    Console.WriteLine("Fetch complete.");
    return "Data from server";
}

public async Task ProcessAsync()
{
    string data = await FetchDataAsync(); // Pauses here, thread free
    Console.WriteLine("Received: " + data);
}
```

**In ASP.NET:** Essential for controller actions and service methods dealing with I/O (database, external APIs) to improve server throughput.
**"Async all the way":** Use `async`/`await` throughout the call stack.
**`ConfigureAwait(false)`:** In library code, can help prevent deadlocks by not resuming on original synchronization context. Less critical in ASP.NET Core but good practice in general libraries.

**Example Code:**
See `10_AsyncAwait.cs` for examples including `Task.Run` for CPU-bound work and `HttpClient`.

```csharp
// Partial example from 10_AsyncAwait.cs
// (Requires async Main or calling from an async context)
public static async Task<string> GetWebPageAsync(string url)
{
    using (HttpClient client = new HttpClient())
    {
        // Asynchronously get the string content from the URL
        string content = await client.GetStringAsync(url);
        return content.Substring(0, Math.Min(content.Length, 100)); // First 100 chars
    }
}

// In an async method:
// string data = await GetWebPageAsync("https://www.microsoft.com");
// Console.WriteLine(data);
```

---

## 12. File I/O (Simple Example)

Working with files and directories using `System.IO`.

**Writing Text:**
*   `File.WriteAllText(filePath, content)`: Creates/overwrites file with string.
*   `File.AppendAllText(filePath, content)`: Creates/appends string to file.
*   `StreamWriter`: More control, line-by-line writing. Use with `using`.
    ```csharp
    using (StreamWriter writer = new StreamWriter(filePath, append: true))
    {
        writer.WriteLine("Another line.");
    }
    ```

**Reading Text:**
*   `File.ReadAllText(filePath)`: Reads entire file into one string.
*   `File.ReadAllLines(filePath)`: Reads file into `string[]` (lines).
*   `StreamReader`: Efficient for large files, line-by-line. Use with `using`.
    ```csharp
    using (StreamReader reader = new StreamReader(filePath))
    {
        string? line;
        while ((line = reader.ReadLine()) != null) { Console.WriteLine(line); }
    }
    ```

**Important:**
*   **`using` Statement:** Crucial for `StreamWriter`, `StreamReader` (and other `IDisposable` objects) to ensure resources are released.
*   **Error Handling:** File operations can throw exceptions (`FileNotFoundException`, `IOException`). Use `try-catch`.
*   **Paths:** `Path.Combine()` for platform-independent paths.
*   **Async File I/O:** `File.ReadAllTextAsync()`, etc., for use with `async`/`await`.

**Example Code:**
See `11_FileIO.cs` for examples of these operations, plus basic `FileInfo` and `Directory` usage.

```csharp
// Partial example from 11_FileIO.cs
string demoFile = "test.txt";
try
{
    File.WriteAllText(demoFile, "Hello, File I/O!");
    string content = File.ReadAllText(demoFile);
    Console.WriteLine(content); // Hello, File I/O!
}
catch (Exception ex)
{
    Console.WriteLine("File error: " + ex.Message);
}
finally
{
    if (File.Exists(demoFile)) File.Delete(demoFile);
}
```

---

## 13. Next Steps: C# to ASP.NET

Congratulations! This C# foundation is key for ASP.NET. Here's how concepts translate:

*   **Classes & OOP:**
    *   **Controllers (MVC/API):** Classes where methods (actions) handle HTTP requests.
    *   **Models:** Classes defining data structures (e.g., `Product`, `User`).
    *   **Services:** Classes for business logic.
*   **Methods:** Become action methods in controllers, logic in services.
*   **LINQ:**
    *   **Database Queries (Entity Framework Core):** Use LINQ to query databases in C#.
      `var products = await _context.Products.Where(p => p.IsActive).ToListAsync();`
*   **Async/Await:** **Essential** in ASP.NET for scalable I/O operations (database calls, external API requests).
    `public async Task<IActionResult> GetProduct(int id) { ... await _service.GetByIdAsync(id); ... }`
*   **Error Handling:** `try-catch` for logic, ASP.NET middleware for global error pages/responses.
*   **Interfaces:** Core to **Dependency Injection (DI)** in ASP.NET Core for loosely coupled, testable code.

**What to Learn Next for ASP.NET:**

1.  **ASP.NET Core Fundamentals:** Request pipeline, middleware, routing, DI, configuration.
2.  **Choose a Model:**
    *   **ASP.NET Core MVC:** Server-rendered HTML (Views, ViewModels).
    *   **ASP.NET Core Razor Pages:** Simpler, page-focused model.
    *   **ASP.NET Core Web API:** For HTTP services (JSON/XML data).
3.  **Entity Framework Core (EF Core):** For database interaction.
4.  **Identity:** For authentication/authorization.
5.  **Client-Side (if applicable):** HTML, CSS, JavaScript (React, Angular, Vue for SPAs).

Your C# skills are the launchpad. Good luck with ASP.NET!

---

This concludes the C# Crash Course. Remember to experiment with the provided `.cs` files to solidify your understanding.
