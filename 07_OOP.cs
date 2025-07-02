// C# Crash Course - 07_OOP.cs
using System;
using System.Collections.Generic; // For List<T>

namespace OOPDemo
{
    // --- 1. Classes and Objects ---

    // Defining a class: Blueprint for 'Car' objects
    public class Car
    {
        // Fields (usually private to encapsulate data)
        private string _color;
        private int _year;

        // Properties (provide controlled public access to private fields)
        // Long-hand property with backing field
        public string Color
        {
            get { return _color; }
            set
            {
                if (string.IsNullOrEmpty(value))
                {
                    Console.WriteLine("Color cannot be empty.");
                    _color = "DefaultColor"; // Or throw an exception
                }
                else
                {
                    _color = value;
                }
            }
        }

        // Auto-implemented property (compiler creates a private backing field)
        public string Model { get; set; } // Common and concise

        public int Year
        {
            get { return _year; }
            private set // Can only be set from within this class (e.g., in constructor)
            {
                if (value > 1885 && value <= DateTime.Now.Year + 1) // Basic validation
                {
                    _year = value;
                }
                else
                {
                    _year = DateTime.Now.Year; // Default to current year if invalid
                    Console.WriteLine("Invalid year provided, defaulting to current year.");
                }
            }
        }

        // Static field (shared among all instances of the Car class)
        public static int NumberOfCarsCreated = 0;

        // Constructor: Special method to initialize a new object
        // This is the primary constructor
        public Car(string model, string color, int year)
        {
            Console.WriteLine("Car object is being created...");
            Model = model; // Uses the property setter
            Color = color; // Uses the property setter
            Year = year;   // Uses the property setter (which is private for set)
            NumberOfCarsCreated++;
        }

        // Another constructor (overloaded) - e.g., if year is not provided
        public Car(string model, string color) : this(model, color, DateTime.Now.Year) // Constructor chaining
        {
            Console.WriteLine("Car object created with default year.");
            // NumberOfCarsCreated is already incremented by the chained constructor
        }

        // Default constructor (if you need one and have other constructors defined)
        public Car() : this("Unknown", "Black", DateTime.Now.Year)
        {
            Console.WriteLine("Car object created with default constructor values.");
        }


        // Methods (define behavior)
        public void StartEngine()
        {
            Console.WriteLine($"{Model} engine started.");
        }

        public void DisplayInfo()
        {
            // 'this' keyword refers to the current instance of the class.
            // It's often optional but can be used for clarity or to distinguish
            // between local variables/parameters and instance members.
            Console.WriteLine($"Car Info: Model={this.Model}, Color={this.Color}, Year={this.Year}");
        }

        // Static method (can be called on the class itself, not an instance)
        public static void DisplayTotalCars()
        {
            Console.WriteLine($"Total cars created: {NumberOfCarsCreated}");
        }
    }

    // --- 2. Encapsulation (demonstrated in Car class with private fields and public properties) ---
    // Access Modifiers: public, private, protected, internal, protected internal, private protected

    // --- 3. Inheritance ---

    // Base Class (Parent)
    public class Vehicle
    {
        public string RegistrationNumber { get; set; }
        protected int NumberOfWheels { get; set; } // Accessible by Vehicle and derived classes

        public Vehicle(string regNumber, int wheels)
        {
            RegistrationNumber = regNumber;
            NumberOfWheels = wheels;
            Console.WriteLine("Vehicle constructor called.");
        }

        public void Move()
        {
            Console.WriteLine("Vehicle is moving.");
        }

        // Virtual method: can be overridden by derived classes
        public virtual void ShowDetails()
        {
            Console.WriteLine($"Vehicle Details: Reg={RegistrationNumber}, Wheels={NumberOfWheels}");
        }
    }

    // Derived Class (Child) - inherits from Vehicle
    public class Motorcycle : Vehicle
    {
        public bool HasSidecar { get; set; }

        // Constructor for Motorcycle, calls base class constructor
        public Motorcycle(string regNumber, bool hasSidecar)
            : base(regNumber, 2) // Motorcycles typically have 2 wheels
        {
            HasSidecar = hasSidecar;
            Console.WriteLine("Motorcycle constructor called.");
            // this.NumberOfWheels = 2; // Can access protected member
        }

        // Overriding the virtual method from the base class
        public override void ShowDetails()
        {
            base.ShowDetails(); // Calls the base class's ShowDetails method
            Console.WriteLine($"Motorcycle Specific: Has Sidecar = {HasSidecar}");
        }

        public void DoWheelie()
        {
            Console.WriteLine("Motorcycle is doing a wheelie (if capable)!");
        }
    }

    // Another derived class
    public class Truck : Vehicle
    {
        public double CargoCapacity { get; set; }

        public Truck(string regNumber, int wheels, double capacity) : base(regNumber, wheels)
        {
            CargoCapacity = capacity;
            Console.WriteLine("Truck constructor called.");
        }

        public override void ShowDetails()
        {
            // base.ShowDetails(); // Optionally call base
            Console.WriteLine($"Truck Details: Reg={RegistrationNumber}, Wheels={NumberOfWheels}, Capacity={CargoCapacity} tons");
        }
    }


    // --- 5. Abstraction ---

    // Abstract Class: Cannot be instantiated. Can have abstract and non-abstract members.
    public abstract class Shape
    {
        public string Name { get; set; }

        // Abstract method: Must be implemented by derived non-abstract classes
        public abstract double CalculateArea();

        // Non-abstract method
        public void DisplayName()
        {
            Console.WriteLine($"Shape Name: {Name}");
        }

        protected Shape(string name)
        {
            Name = name;
        }
    }

    public class Circle : Shape
    {
        public double Radius { get; set; }

        public Circle(double radius) : base("Circle")
        {
            Radius = radius;
        }

        public override double CalculateArea() // Implementation of abstract method
        {
            return Math.PI * Radius * Radius;
        }
    }

    public class Rectangle : Shape
    {
        public double Width { get; set; }
        public double Height { get; set; }

        public Rectangle(double width, double height) : base("Rectangle")
        {
            Width = width;
            Height = height;
        }

        public override double CalculateArea()
        {
            return Width * Height;
        }
    }

    // Interface: Defines a contract. Cannot be instantiated.
    // Contains only signatures for methods, properties, events, or indexers.
    // (C# 8.0+ allows default implementations in interfaces)
    public interface ILoggable
    {
        void LogInfo(string message);
        void LogError(string message, Exception ex = null); // Optional parameter
        string LoggerName { get; } // Read-only property in interface
    }

    public interface ISaveable
    {
        bool Save();
        DateTime LastSaved { get; }
    }

    // Class implementing multiple interfaces
    public class Document : ILoggable, ISaveable
    {
        public string Title { get; set; }
        private DateTime _lastSaved;

        public string LoggerName => $"DocumentLogger_{Title}"; // Expression-bodied property

        public Document(string title)
        {
            Title = title;
            _lastSaved = DateTime.MinValue;
        }

        public void LogInfo(string message)
        {
            Console.WriteLine($"[INFO] {LoggerName}: {message}");
        }

        public void LogError(string message, Exception ex = null)
        {
            Console.WriteLine($"[ERROR] {LoggerName}: {message} {(ex != null ? ex.Message : "")}");
        }

        public bool Save()
        {
            Console.WriteLine($"Saving document: {Title}...");
            // Simulate save operation
            _lastSaved = DateTime.Now;
            LogInfo("Document saved successfully.");
            return true;
        }
        public DateTime LastSaved => _lastSaved;
    }


    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("--- C# OOP Demo ---");
            Console.WriteLine();

            // --- 1. Classes and Objects ---
            Console.WriteLine("--- 1. Classes and Objects ---");
            Car myCar = new Car("SedanX", "Red", 2023);
            myCar.DisplayInfo();
            myCar.StartEngine();
            myCar.Color = "Blue"; // Using the property setter
            // myCar.Year = 2020; // Error: Setter for Year is private
            myCar.DisplayInfo();

            Car anotherCar = new Car("SUVMax", "Black"); // Uses overloaded constructor
            anotherCar.DisplayInfo();

            Car defaultCar = new Car();
            defaultCar.DisplayInfo();

            Console.WriteLine($"Current Color of myCar: {myCar.Color}"); // Using property getter
            Car.DisplayTotalCars(); // Calling static method
            Console.WriteLine();


            // --- 3. Inheritance ---
            Console.WriteLine("--- 3. Inheritance ---");
            Motorcycle myMotorcycle = new Motorcycle("MC-123", true);
            myMotorcycle.Move();         // Inherited from Vehicle
            myMotorcycle.ShowDetails();  // Overridden method
            myMotorcycle.DoWheelie();    // Motorcycle specific method

            Truck myTruck = new Truck("TRK-789", 18, 20.5);
            myTruck.Move();
            myTruck.ShowDetails();
            Console.WriteLine();

            // --- 4. Polymorphism ---
            Console.WriteLine("--- 4. Polymorphism ---");
            // A Vehicle reference can hold a Motorcycle or Truck object
            Vehicle vehicle1 = new Motorcycle("MC-456", false);
            Vehicle vehicle2 = new Truck("TRK-001", 6, 10.0);

            vehicle1.ShowDetails(); // Calls Motorcycle's ShowDetails
            vehicle2.ShowDetails(); // Calls Truck's ShowDetails

            Console.WriteLine("\nPolymorphism with a list:");
            List<Vehicle> vehicles = new List<Vehicle>
            {
                new Motorcycle("MC-789", true),
                new Truck("TRK-111", 4, 5.0),
                new Vehicle("GEN-001", 4) // Base vehicle instance
            };

            foreach (var v in vehicles)
            {
                v.ShowDetails(); // Dynamically calls the correct overridden method
                // v.DoWheelie(); // Error: Vehicle type doesn't know DoWheelie. Need casting or type check.
                if (v is Motorcycle moto) // Type checking and casting with 'is' and pattern matching
                {
                    moto.DoWheelie();
                }
            }
            Console.WriteLine();


            // --- 5. Abstraction (Abstract Classes and Interfaces) ---
            Console.WriteLine("--- 5. Abstraction ---");
            Console.WriteLine("-- Abstract Class Example --");
            // Shape myShape = new Shape("Generic"); // Error: Cannot create an instance of an abstract class

            Shape circle = new Circle(5.0);
            circle.DisplayName();
            Console.WriteLine($"Area of {circle.Name}: {circle.CalculateArea():F2}");

            Shape rectangle = new Rectangle(4.0, 6.0);
            rectangle.DisplayName();
            Console.WriteLine($"Area of {rectangle.Name}: {rectangle.CalculateArea():F2}");
            Console.WriteLine();

            Console.WriteLine("-- Interface Example --");
            Document report = new Document("Annual Report 2023");
            report.LogInfo("Starting report generation.");
            report.Save();
            Console.WriteLine($"Report '{report.Title}' last saved at: {report.LastSaved}");

            // Using interface types
            ILoggable logger = report; // report IS-A ILoggable
            logger.LogError("A minor issue occurred during processing.");
            Console.WriteLine($"Logger Name: {logger.LoggerName}");

            ISaveable saveableItem = report; // report IS-A ISaveable
            Console.WriteLine($"Item can be saved. Last saved: {saveableItem.LastSaved}");
            Console.WriteLine();

            Console.WriteLine("--- End of OOP Demo ---");
        }
    }
}
