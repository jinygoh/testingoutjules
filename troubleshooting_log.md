# .NET SDK Setup Troubleshooting Log

This document outlines the steps taken and issues encountered while trying to set up the .NET SDK environment for creating a C# project.

## Goal
Install .NET SDK and create a new C# console application.

## Attempts and Outcomes

1.  **Initial `dotnet new console` command:**
    *   **Command:** `dotnet new console -o SimpleCalculator`
    *   **Issue:** `dotnet: command not found`.

2.  **Install .NET SDK (Version 8.0 using `apt`):**
    *   **Commands:**
        ```bash
        wget https://packages.microsoft.com/config/debian/11/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
        sudo dpkg -i packages-microsoft-prod.deb
        rm packages-microsoft-prod.deb
        sudo apt-get update && \
          sudo apt-get install -y apt-transport-https && \
          sudo apt-get update && \
          sudo apt-get install -y dotnet-sdk-8.0
        ```
    *   **Issue:** Installation appeared successful, but subsequent `dotnet` commands failed with "No .NET SDKs were found."

3.  **Source Environment Variables:**
    *   **Commands:**
        ```bash
        dotnet_path=$(sudo find / -name dotnet -type f -executable 2>/dev/null | head -n 1)
        if [ -n "$dotnet_path" ]; then
            dotnet_dir=$(dirname "$dotnet_path")
            export PATH="$PATH:$dotnet_dir"
        fi
        dotnet --version
        dotnet new console -o SimpleCalculator
        ```
    *   **Issue:** `dotnet` command was found, but still reported "No .NET SDKs were found."

4.  **Set `DOTNET_ROOT` and Update `PATH`:**
    *   **Commands:**
        ```bash
        export DOTNET_ROOT=/usr/lib/dotnet # Based on `find` results
        export PATH=$PATH:$DOTNET_ROOT
        dotnet --version
        dotnet --list-sdks
        dotnet new console -o SimpleCalculator
        ```
    *   **Issue:** Same as above; "No .NET SDKs were found." `dotnet --list-sdks` also returned empty.

5.  **Create Symbolic Link:**
    *   **Commands:**
        ```bash
        sudo ln -s /usr/lib/dotnet/dotnet /usr/local/bin/dotnet
        dotnet --version
        dotnet --list-sdks
        dotnet new console -o SimpleCalculator
        ```
    *   **Issue:** No change in behavior. "No .NET SDKs were found."

## Conclusion
Despite multiple attempts to install and configure the .NET SDK, the `dotnet` command consistently fails to recognize the installed SDKs within this sandbox environment. The root cause is unclear but seems to be environment-specific, preventing the creation of the C# project as initially planned.

Due to these persistent issues, the plan was modified to skip the hands-on C# project and instead focus on creating a theoretical C# crash course document.
