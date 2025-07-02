// AspNetCrashCourse/Models/ErrorViewModel.cs
namespace AspNetCrashCourse.Models
{
    public class ErrorViewModel
    {
        public string? RequestId { get; set; }

        public bool ShowRequestId => !string.IsNullOrEmpty(RequestId);
    }
}
