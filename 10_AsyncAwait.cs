// C# Crash Course - 10_AsyncAwait.cs
using System;
using System.Net.Http; // For HttpClient
using System.Threading; // For Thread.Sleep (demonstration purposes)
using System.Threading.Tasks; // Essential for Task, async, await

namespace AsyncAwaitDemo
{
    class Program
    {
        // --- Simulating Long-Running Operations ---

        // Simulates a CPU-bound operation (less ideal for async/await on its own,
        // but Task.Run can offload it)
        private static int PerformComplexCalculation()
        {
            Console.WriteLine($"[{Thread.CurrentThread.ManagedThreadId}] Starting complex calculation...");
            Thread.Sleep(3000); // Simulate work - BAD in async method, use Task.Delay
            Console.WriteLine($"[{Thread.CurrentThread.ManagedThreadId}] Finished complex calculation.");
            return 123;
        }

        // Simulates an I/O-bound operation (e.g., network call, file access)
        // This is the primary use case for async/await.
        private static async Task<string> FetchDataFromNetworkAsync(string url)
        {
            Console.WriteLine($"[{Thread.CurrentThread.ManagedThreadId}] Starting network fetch for {url}...");
            // In a real app, you'd use HttpClient or similar.
            // Task.Delay simulates the network latency without blocking the thread.
            await Task.Delay(2000); // Non-blocking delay
            Console.WriteLine($"[{Thread.CurrentThread.ManagedThreadId}] Finished network fetch for {url}.");
            return $"Data from {url}";
        }

        // Another I/O-bound simulation
        private static async Task<string> DownloadWebsiteContentAsync(string url)
        {
            Console.WriteLine($"[{Thread.CurrentThread.ManagedThreadId}] Starting download for {url}...");
            using (HttpClient client = new HttpClient())
            {
                try
                {
                    // Asynchronously gets the response from the URL.
                    // The thread is released here if the operation is truly async.
                    string content = await client.GetStringAsync(url);
                    Console.WriteLine($"[{Thread.CurrentThread.ManagedThreadId}] Finished download for {url}. Length: {content.Length}");
                    return content.Substring(0, Math.Min(content.Length, 150)) + "..."; // Return first 150 chars
                }
                catch (HttpRequestException ex)
                {
                    Console.WriteLine($"[{Thread.CurrentThread.ManagedThreadId}] Error downloading {url}: {ex.Message}");
                    return $"Error: {ex.Message}";
                }
            }
        }


        // --- Async Methods ---

        public static async Task ProcessDataAsync()
        {
            Console.WriteLine($"[{Thread.CurrentThread.ManagedThreadId}] ProcessDataAsync: Starting...");

            // Awaiting an I/O-bound operation
            string data1 = await FetchDataFromNetworkAsync("api/users");
            Console.WriteLine($"[{Thread.CurrentThread.ManagedThreadId}] ProcessDataAsync: Received data1 - '{data1}'");

            string data2 = await FetchDataFromNetworkAsync("api/products");
            Console.WriteLine($"[{Thread.CurrentThread.ManagedThreadId}] ProcessDataAsync: Received data2 - '{data2}'");

            Console.WriteLine($"[{Thread.CurrentThread.ManagedThreadId}] ProcessDataAsync: All data fetched and processed.");
        }

        public static async Task<int> GetCalculatedValueAsync()
        {
            Console.WriteLine($"[{Thread.CurrentThread.ManagedThreadId}] GetCalculatedValueAsync: Starting...");
            // For CPU-bound work that you want to run on a background thread
            // and await its completion, use Task.Run.
            int result = await Task.Run(() => PerformComplexCalculation());
            Console.WriteLine($"[{Thread.CurrentThread.ManagedThreadId}] GetCalculatedValueAsync: Calculation complete. Result: {result}");
            return result;
        }

        public static async Task PerformMultipleDownloadsAsync()
        {
            Console.WriteLine($"[{Thread.CurrentThread.ManagedThreadId}] PerformMultipleDownloadsAsync: Starting multiple downloads...");

            // Start multiple tasks concurrently
            Task<string> googleTask = DownloadWebsiteContentAsync("https://www.google.com");
            Task<string> microsoftTask = DownloadWebsiteContentAsync("https://www.microsoft.com");
            Task<string> nonExistentTask = DownloadWebsiteContentAsync("https://nonexistent.invalid");


            // Asynchronously wait for all of them to complete
            // await Task.WhenAll(googleTask, microsoftTask, nonExistentTask);
            // Console.WriteLine($"[{Thread.CurrentThread.ManagedThreadId}] All downloads complete.");
            // string googleContent = googleTask.Result; // Access result after await or .Result
            // string microsoftContent = microsoftTask.Result;
            // string nonExistentContent = nonExistentTask.Result;

            // More robust: await results individually or handle exceptions per task
            string googleContent = "Error";
            string microsoftContent = "Error";
            string nonExistentContent = "Error";

            try { googleContent = await googleTask; } catch (Exception ex) { Console.WriteLine($"Error Google: {ex.Message}"); }
            try { microsoftContent = await microsoftTask; } catch (Exception ex) { Console.WriteLine($"Error Microsoft: {ex.Message}"); }
            try { nonExistentContent = await nonExistentTask; } catch (Exception ex) { Console.WriteLine($"Error NonExistent: {ex.Message}"); }


            Console.WriteLine($"\n[{Thread.CurrentThread.ManagedThreadId}] --- Google Content Start ---");
            Console.WriteLine(googleContent);
            Console.WriteLine($"[{Thread.CurrentThread.ManagedThreadId}] --- Google Content End ---\n");

            Console.WriteLine($"[{Thread.CurrentThread.ManagedThreadId}] --- Microsoft Content Start ---");
            Console.WriteLine(microsoftContent);
            Console.WriteLine($"[{Thread.CurrentThread.ManagedThreadId}] --- Microsoft Content End ---\n");

            Console.WriteLine($"[{Thread.CurrentThread.ManagedThreadId}] --- NonExistent Content Start ---");
            Console.WriteLine(nonExistentContent);
            Console.WriteLine($"[{Thread.CurrentThread.ManagedThreadId}] --- NonExistent Content End ---\n");
        }


        // --- Main Method (Entry Point) ---
        // C# 7.1 and later allow async Main
        static async Task Main(string[] args)
        {
            Console.WriteLine($"[{Thread.CurrentThread.ManagedThreadId}] --- C# Async/Await Demo ---");
            Console.WriteLine($"Main thread ID: {Thread.CurrentThread.ManagedThreadId}");
            Console.WriteLine();

            Console.WriteLine($"[{Thread.CurrentThread.ManagedThreadId}] === Test 1: Sequential Async Calls ===");
            await ProcessDataAsync(); // Await the completion of this async method
            Console.WriteLine($"[{Thread.CurrentThread.ManagedThreadId}] Main: ProcessDataAsync has completed.");
            Console.WriteLine();

            Console.WriteLine($"[{Thread.CurrentThread.ManagedThreadId}] === Test 2: Async Call with Result and Task.Run for CPU-bound work ===");
            int calculatedResult = await GetCalculatedValueAsync();
            Console.WriteLine($"[{Thread.CurrentThread.ManagedThreadId}] Main: GetCalculatedValueAsync result: {calculatedResult}");
            Console.WriteLine();

            Console.WriteLine($"[{Thread.CurrentThread.ManagedThreadId}] === Test 3: Concurrent Async Calls with Task.WhenAll (or individual awaits) ===");
            // Note: For ASP.NET, HttpClientFactory is preferred for managing HttpClient instances.
            await PerformMultipleDownloadsAsync();
            Console.WriteLine($"[{Thread.CurrentThread.ManagedThreadId}] Main: PerformMultipleDownloadsAsync has completed.");
            Console.WriteLine();


            // How to call an async method if Main cannot be async (older C# versions)
            // Console.WriteLine("Calling async method from non-async Main (using .Wait() or .GetAwaiter().GetResult())");
            // Task myTask = ProcessDataAsync();
            // Console.WriteLine("Main thread continues to do some work...");
            // myTask.Wait(); // Blocks the Main thread until myTask completes. CAUTION with this in UI/ASP.NET.
            // Console.WriteLine("Async method completed (non-async Main).");


            Console.WriteLine($"[{Thread.CurrentThread.ManagedThreadId}] --- End of Async/Await Demo ---");
        }
    }
}
// Note: To run this console app and see network requests, ensure your environment allows internet access.
// If running in a restricted sandbox, HttpClient calls might fail.
// The Thread.Sleep in PerformComplexCalculation is a blocking call, used here to illustrate
// how Task.Run can offload it from the calling thread. In a truly async method,
// you would use await Task.Delay for non-CPU-bound pauses.
