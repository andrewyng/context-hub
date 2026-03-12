---
name: s3
description: "AWS S3 SDK for .NET (AWSSDK.S3) - Complete guide for S3 operations in .NET/C# projects"
metadata:
  languages: "csharp"
  versions: "3.7.405.10"
  updated-on: "2026-03-12"
  source: community
  tags: "aws,s3,storage,cloud,bucket,dotnet,csharp"
---

# AWS S3 SDK for .NET (AWSSDK.S3) - Complete Guide

## Golden Rule

**ALWAYS use `AWSSDK.S3` for AWS S3 operations in .NET/C# projects.**

```bash
dotnet add package AWSSDK.S3
```

**DO NOT use:**
- `AWSSDK` meta-package (pulls in every AWS service — too heavy)
- Any unofficial S3 libraries

`AWSSDK.S3` is the official AWS SDK for .NET. It provides the `AmazonS3Client` for low-level operations and `TransferUtility` for high-level file transfers.

**.NET Version Requirements:**
- .NET 6.0 or later (LTS recommended: .NET 8.0 or .NET 10.0)
- .NET Framework 4.6.2+ (legacy support)

---

## Installation

### Basic Installation

```bash
dotnet add package AWSSDK.S3
```

### With Specific Version

```bash
dotnet add package AWSSDK.S3 --version 3.7.405.10
```

### With AWSSDK.Extensions.NETCore.Setup (for DI)

```bash
dotnet add package AWSSDK.S3
dotnet add package AWSSDK.Extensions.NETCore.Setup
```

### PackageReference (csproj)

```xml
<PackageReference Include="AWSSDK.S3" Version="3.7.405.10" />
<PackageReference Include="AWSSDK.Extensions.NETCore.Setup" Version="3.7.302" />
```

### Environment Variables

Create a `.env` file or set environment variables:

```env
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_DEFAULT_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

Load environment variables in your code:

```csharp
using System;

var region = Environment.GetEnvironmentVariable("AWS_DEFAULT_REGION") ?? "us-east-1";
var bucket = Environment.GetEnvironmentVariable("AWS_S3_BUCKET") ?? "my-bucket";
```

### AWS Credentials Configuration

The AWS SDK for .NET resolves credentials in this order:

1. Environment variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`)
2. Shared credentials file (`~/.aws/credentials`)
3. AWS config file (`~/.aws/config`)
4. ECS container credentials
5. IAM instance profile (EC2)

Configure credentials using AWS CLI:

```bash
aws configure
```

---

## Initialization

### Basic Client Setup

```csharp
using Amazon.S3;

// Default credentials from environment or AWS config
using var s3 = new AmazonS3Client();
```

### Client with Region

```csharp
using Amazon.S3;
using Amazon;

using var s3 = new AmazonS3Client(RegionEndpoint.USEast1);
```

### Client with Explicit Credentials

```csharp
using Amazon.S3;
using Amazon;
using Amazon.Runtime;

var credentials = new BasicAWSCredentials("YOUR_ACCESS_KEY", "YOUR_SECRET_KEY");
using var s3 = new AmazonS3Client(credentials, RegionEndpoint.USEast1);
```

### Client with Session Credentials (Temporary)

```csharp
using Amazon.S3;
using Amazon;
using Amazon.Runtime;

var credentials = new SessionAWSCredentials(
    "YOUR_ACCESS_KEY",
    "YOUR_SECRET_KEY",
    "SESSION_TOKEN"
);
using var s3 = new AmazonS3Client(credentials, RegionEndpoint.USEast1);
```

### Client with Profile

```csharp
using Amazon.S3;
using Amazon.Runtime.CredentialManagement;

var chain = new CredentialProfileStoreChain();
if (chain.TryGetAWSCredentials("my-profile", out var credentials))
{
    using var s3 = new AmazonS3Client(credentials, RegionEndpoint.USEast1);
}
```

### Client with Custom Endpoint (LocalStack, MinIO)

```csharp
using Amazon.S3;
using Amazon;

var config = new AmazonS3Config
{
    ServiceURL = "http://localhost:4566",
    ForcePathStyle = true,
    AuthenticationRegion = "us-east-1"
};

var credentials = new Amazon.Runtime.BasicAWSCredentials("test", "test");
using var s3 = new AmazonS3Client(credentials, config);
```

### Dependency Injection Setup (ASP.NET Core)

```csharp
using Amazon.S3;

var builder = WebApplication.CreateBuilder(args);

// Reads config from appsettings.json "AWS" section and environment
builder.Services.AddDefaultAWSOptions(builder.Configuration.GetAWSOptions());
builder.Services.AddAWSService<IAmazonS3>();

var app = builder.Build();
```

With `appsettings.json`:

```json
{
  "AWS": {
    "Profile": "default",
    "Region": "us-east-1"
  }
}
```

Inject into services:

```csharp
public class MyService
{
    private readonly IAmazonS3 _s3;

    public MyService(IAmazonS3 s3)
    {
        _s3 = s3;
    }
}
```

### TransferUtility Setup

```csharp
using Amazon.S3;
using Amazon.S3.Transfer;

using var s3 = new AmazonS3Client(RegionEndpoint.USEast1);
using var transferUtility = new TransferUtility(s3);
```

---

## Bucket Operations

### List All Buckets

```csharp
using Amazon.S3;
using Amazon.S3.Model;

using var s3 = new AmazonS3Client();

async Task ListBucketsAsync()
{
    try
    {
        var response = await s3.ListBucketsAsync();

        Console.WriteLine("Buckets:");
        foreach (var bucket in response.Buckets)
        {
            Console.WriteLine($"  • {bucket.BucketName} (Created: {bucket.CreationDate})");
        }
    }
    catch (AmazonS3Exception e)
    {
        Console.WriteLine($"Error listing buckets: {e.Message}");
    }
}
```

### Create Bucket

```csharp
using Amazon.S3;
using Amazon.S3.Model;

using var s3 = new AmazonS3Client();

async Task CreateBucketAsync(string bucketName)
{
    try
    {
        var request = new PutBucketRequest { BucketName = bucketName };
        await s3.PutBucketAsync(request);
        Console.WriteLine($"Bucket created: {bucketName}");
    }
    catch (AmazonS3Exception e)
    {
        Console.WriteLine($"Error creating bucket: {e.Message}");
    }
}
```

### Create Bucket in Specific Region

```csharp
using Amazon.S3;
using Amazon.S3.Model;

using var s3 = new AmazonS3Client(RegionEndpoint.USWest2);

async Task CreateBucketInRegionAsync(string bucketName, string region)
{
    try
    {
        var request = new PutBucketRequest
        {
            BucketName = bucketName,
            BucketRegionName = region
        };

        await s3.PutBucketAsync(request);
        Console.WriteLine($"Bucket created in {region}");
    }
    catch (AmazonS3Exception e)
    {
        Console.WriteLine($"Error creating bucket: {e.Message}");
    }
}
```

### Delete Bucket

```csharp
using Amazon.S3;
using Amazon.S3.Model;

using var s3 = new AmazonS3Client();

async Task DeleteBucketAsync(string bucketName)
{
    try
    {
        await s3.DeleteBucketAsync(bucketName);
        Console.WriteLine($"Bucket deleted: {bucketName}");
    }
    catch (AmazonS3Exception e)
    {
        Console.WriteLine($"Error deleting bucket: {e.Message}");
    }
}
```

### Check if Bucket Exists

```csharp
using Amazon.S3;
using Amazon.S3.Util;

using var s3 = new AmazonS3Client();

async Task<bool> BucketExistsAsync(string bucketName)
{
    try
    {
        return await AmazonS3Util.DoesS3BucketExistV2Async(s3, bucketName);
    }
    catch (AmazonS3Exception e)
    {
        Console.WriteLine($"Error: {e.Message}");
        return false;
    }
}
```

### Get Bucket Location

```csharp
using Amazon.S3;
using Amazon.S3.Model;

using var s3 = new AmazonS3Client();

async Task<string?> GetBucketLocationAsync(string bucketName)
{
    try
    {
        var response = await s3.GetBucketLocationAsync(
            new GetBucketLocationRequest { BucketName = bucketName }
        );

        var location = response.Location?.Value ?? "us-east-1";
        Console.WriteLine($"Bucket location: {location}");
        return location;
    }
    catch (AmazonS3Exception e)
    {
        Console.WriteLine($"Error: {e.Message}");
        return null;
    }
}
```

---

## Object Upload Operations

### Upload File from Disk

```csharp
using Amazon.S3;
using Amazon.S3.Transfer;

using var s3 = new AmazonS3Client();
using var transferUtility = new TransferUtility(s3);

async Task UploadFileAsync(string filePath, string bucketName, string objectKey)
{
    try
    {
        await transferUtility.UploadAsync(filePath, bucketName, objectKey);
        Console.WriteLine($"Uploaded {filePath} to {bucketName}/{objectKey}");
    }
    catch (AmazonS3Exception e)
    {
        Console.WriteLine($"Upload error: {e.Message}");
    }
}
```

### Upload with PutObject

```csharp
using Amazon.S3;
using Amazon.S3.Model;
using System.Text;

using var s3 = new AmazonS3Client();

async Task UploadObjectAsync(string bucketName, string key, string data)
{
    try
    {
        var request = new PutObjectRequest
        {
            BucketName = bucketName,
            Key = key,
            ContentBody = data
        };

        await s3.PutObjectAsync(request);
        Console.WriteLine($"Uploaded to {key}");
    }
    catch (AmazonS3Exception e)
    {
        Console.WriteLine($"Upload error: {e.Message}");
    }
}

// Upload string
await UploadObjectAsync("my-bucket", "file.txt", "Hello, S3!");

// Upload JSON
using System.Text.Json;
var json = JsonSerializer.Serialize(new { key = "value" });
await UploadObjectAsync("my-bucket", "data.json", json);
```

### Upload with Content Type

```csharp
using Amazon.S3;
using Amazon.S3.Transfer;

using var s3 = new AmazonS3Client();
using var transferUtility = new TransferUtility(s3);

async Task UploadWithContentTypeAsync(string bucketName, string key, string filePath, string contentType)
{
    try
    {
        var request = new TransferUtilityUploadRequest
        {
            BucketName = bucketName,
            Key = key,
            FilePath = filePath,
            ContentType = contentType
        };

        await transferUtility.UploadAsync(request);
        Console.WriteLine($"Uploaded {key} as {contentType}");
    }
    catch (AmazonS3Exception e)
    {
        Console.WriteLine($"Upload error: {e.Message}");
    }
}

// Usage
await UploadWithContentTypeAsync("my-bucket", "image.jpg", "./photo.jpg", "image/jpeg");
```

### Upload with Metadata

```csharp
using Amazon.S3;
using Amazon.S3.Model;

using var s3 = new AmazonS3Client();

async Task UploadWithMetadataAsync(string bucketName, string key, string filePath)
{
    try
    {
        var request = new PutObjectRequest
        {
            BucketName = bucketName,
            Key = key,
            FilePath = filePath
        };

        request.Metadata.Add("uploaded-by", "user123");
        request.Metadata.Add("original-name", "document.pdf");
        request.Metadata.Add("category", "reports");

        await s3.PutObjectAsync(request);
        Console.WriteLine("Uploaded with metadata");
    }
    catch (AmazonS3Exception e)
    {
        Console.WriteLine($"Upload error: {e.Message}");
    }
}
```

### Upload with Server-Side Encryption

```csharp
using Amazon.S3;
using Amazon.S3.Model;

using var s3 = new AmazonS3Client();

async Task UploadEncryptedAsync(string bucketName, string key, string filePath)
{
    try
    {
        var request = new PutObjectRequest
        {
            BucketName = bucketName,
            Key = key,
            FilePath = filePath,
            ServerSideEncryptionMethod = ServerSideEncryptionMethod.AES256
        };

        await s3.PutObjectAsync(request);
        Console.WriteLine("Uploaded with encryption");
    }
    catch (AmazonS3Exception e)
    {
        Console.WriteLine($"Upload error: {e.Message}");
    }
}
```

### Upload with ACL

```csharp
using Amazon.S3;
using Amazon.S3.Model;

using var s3 = new AmazonS3Client();

async Task UploadWithAclAsync(string bucketName, string key, string filePath)
{
    try
    {
        var request = new PutObjectRequest
        {
            BucketName = bucketName,
            Key = key,
            FilePath = filePath,
            CannedACL = S3CannedACL.PublicRead
        };

        await s3.PutObjectAsync(request);
        Console.WriteLine("Uploaded as public");
    }
    catch (AmazonS3Exception e)
    {
        Console.WriteLine($"Upload error: {e.Message}");
    }
}
```

### Upload Binary Data

```csharp
using Amazon.S3;
using Amazon.S3.Model;

using var s3 = new AmazonS3Client();

async Task UploadBinaryAsync(string bucketName, string key, byte[] data)
{
    try
    {
        using var stream = new MemoryStream(data);
        var request = new PutObjectRequest
        {
            BucketName = bucketName,
            Key = key,
            InputStream = stream,
            ContentType = "application/octet-stream"
        };

        await s3.PutObjectAsync(request);
        Console.WriteLine($"Uploaded binary data to {key}");
    }
    catch (AmazonS3Exception e)
    {
        Console.WriteLine($"Upload error: {e.Message}");
    }
}

// Usage
var fileBytes = await File.ReadAllBytesAsync("image.png");
await UploadBinaryAsync("my-bucket", "uploads/image.png", fileBytes);
```

### Upload from Stream

```csharp
using Amazon.S3;
using Amazon.S3.Model;

using var s3 = new AmazonS3Client();

async Task UploadFromStreamAsync(string bucketName, string key, Stream inputStream)
{
    try
    {
        var request = new PutObjectRequest
        {
            BucketName = bucketName,
            Key = key,
            InputStream = inputStream
        };

        await s3.PutObjectAsync(request);
        Console.WriteLine($"Uploaded stream to {key}");
    }
    catch (AmazonS3Exception e)
    {
        Console.WriteLine($"Upload error: {e.Message}");
    }
}
```

### Batch Upload Multiple Files

```csharp
using Amazon.S3;
using Amazon.S3.Transfer;

using var s3 = new AmazonS3Client();
using var transferUtility = new TransferUtility(s3);

async Task UploadDirectoryAsync(string directoryPath, string bucketName, string s3Prefix = "")
{
    try
    {
        var files = Directory.GetFiles(directoryPath, "*", SearchOption.AllDirectories);

        foreach (var filePath in files)
        {
            var relativePath = Path.GetRelativePath(directoryPath, filePath);
            var s3Key = Path.Combine(s3Prefix, relativePath).Replace('\\', '/');

            await transferUtility.UploadAsync(filePath, bucketName, s3Key);
            Console.WriteLine($"Uploaded: {s3Key}");
        }

        Console.WriteLine($"Uploaded directory: {directoryPath}");
    }
    catch (AmazonS3Exception e)
    {
        Console.WriteLine($"Batch upload error: {e.Message}");
    }
}
```

---

## Object Download Operations

### Download File to Disk

```csharp
using Amazon.S3;
using Amazon.S3.Transfer;

using var s3 = new AmazonS3Client();
using var transferUtility = new TransferUtility(s3);

async Task DownloadFileAsync(string bucketName, string key, string filePath)
{
    try
    {
        await transferUtility.DownloadAsync(filePath, bucketName, key);
        Console.WriteLine($"Downloaded to {filePath}");
    }
    catch (AmazonS3Exception e)
    {
        Console.WriteLine($"Download error: {e.Message}");
    }
}
```

### Download as Bytes

```csharp
using Amazon.S3;
using Amazon.S3.Model;

using var s3 = new AmazonS3Client();

async Task<byte[]?> DownloadAsBytesAsync(string bucketName, string key)
{
    try
    {
        var response = await s3.GetObjectAsync(bucketName, key);
        using var memoryStream = new MemoryStream();
        await response.ResponseStream.CopyToAsync(memoryStream);
        return memoryStream.ToArray();
    }
    catch (AmazonS3Exception e)
    {
        Console.WriteLine($"Download error: {e.Message}");
        return null;
    }
}

// Usage
var data = await DownloadAsBytesAsync("my-bucket", "file.txt");
```

### Download as String

```csharp
using Amazon.S3;
using Amazon.S3.Model;

using var s3 = new AmazonS3Client();

async Task<string?> DownloadAsStringAsync(string bucketName, string key)
{
    try
    {
        var response = await s3.GetObjectAsync(bucketName, key);
        using var reader = new StreamReader(response.ResponseStream);
        return await reader.ReadToEndAsync();
    }
    catch (AmazonS3Exception e)
    {
        Console.WriteLine($"Download error: {e.Message}");
        return null;
    }
}

// Download JSON
using System.Text.Json;

async Task<T?> DownloadJsonAsync<T>(string bucketName, string key)
{
    var content = await DownloadAsStringAsync(bucketName, key);
    return content is not null ? JsonSerializer.Deserialize<T>(content) : default;
}
```

### Download with Error Handling

```csharp
using Amazon.S3;
using Amazon.S3.Transfer;

using var s3 = new AmazonS3Client();
using var transferUtility = new TransferUtility(s3);

async Task<bool> DownloadSafeAsync(string bucketName, string key, string filePath)
{
    try
    {
        await transferUtility.DownloadAsync(filePath, bucketName, key);
        Console.WriteLine($"Downloaded to {filePath}");
        return true;
    }
    catch (AmazonS3Exception e) when (e.StatusCode == System.Net.HttpStatusCode.NotFound)
    {
        Console.WriteLine($"Object not found: {key}");
        return false;
    }
    catch (AmazonS3Exception e)
    {
        Console.WriteLine($"Error: {e.Message}");
        return false;
    }
}
```

### Download with Version

```csharp
using Amazon.S3;
using Amazon.S3.Model;

using var s3 = new AmazonS3Client();

async Task DownloadVersionAsync(string bucketName, string key, string filePath, string versionId)
{
    try
    {
        var request = new GetObjectRequest
        {
            BucketName = bucketName,
            Key = key,
            VersionId = versionId
        };

        using var response = await s3.GetObjectAsync(request);
        await response.WriteResponseStreamToFileAsync(filePath, false, CancellationToken.None);
        Console.WriteLine($"Downloaded version {versionId}");
    }
    catch (AmazonS3Exception e)
    {
        Console.WriteLine($"Download error: {e.Message}");
    }
}
```

### Download Byte Range

```csharp
using Amazon.S3;
using Amazon.S3.Model;

using var s3 = new AmazonS3Client();

async Task<byte[]?> DownloadRangeAsync(string bucketName, string key, long start, long end)
{
    try
    {
        var request = new GetObjectRequest
        {
            BucketName = bucketName,
            Key = key,
            ByteRange = new ByteRange(start, end)
        };

        using var response = await s3.GetObjectAsync(request);
        using var memoryStream = new MemoryStream();
        await response.ResponseStream.CopyToAsync(memoryStream);
        return memoryStream.ToArray();
    }
    catch (AmazonS3Exception e)
    {
        Console.WriteLine($"Download error: {e.Message}");
        return null;
    }
}
```

### Get Object Metadata Only

```csharp
using Amazon.S3;
using Amazon.S3.Model;

using var s3 = new AmazonS3Client();

async Task<GetObjectMetadataResponse?> GetObjectMetadataAsync(string bucketName, string key)
{
    try
    {
        var response = await s3.GetObjectMetadataAsync(bucketName, key);

        Console.WriteLine("Metadata:");
        Console.WriteLine($"  Content-Type: {response.Headers.ContentType}");
        Console.WriteLine($"  Content-Length: {response.ContentLength} bytes");
        Console.WriteLine($"  Last Modified: {response.LastModified}");
        Console.WriteLine($"  ETag: {response.ETag}");
        Console.WriteLine($"  Custom Metadata:");
        foreach (var metaKey in response.Metadata.Keys)
        {
            Console.WriteLine($"    {metaKey}: {response.Metadata[metaKey]}");
        }

        return response;
    }
    catch (AmazonS3Exception e)
    {
        Console.WriteLine($"Error: {e.Message}");
        return null;
    }
}
```

---

## List Objects

### List All Objects

```csharp
using Amazon.S3;
using Amazon.S3.Model;

using var s3 = new AmazonS3Client();

async Task ListObjectsAsync(string bucketName)
{
    try
    {
        var request = new ListObjectsV2Request { BucketName = bucketName };
        var response = await s3.ListObjectsV2Async(request);

        if (response.S3Objects.Count > 0)
        {
            Console.WriteLine("Objects:");
            foreach (var obj in response.S3Objects)
            {
                Console.WriteLine($"  • {obj.Key} ({obj.Size} bytes)");
            }
        }
        else
        {
            Console.WriteLine("Bucket is empty");
        }
    }
    catch (AmazonS3Exception e)
    {
        Console.WriteLine($"List error: {e.Message}");
    }
}
```

### List Objects with Prefix

```csharp
using Amazon.S3;
using Amazon.S3.Model;

using var s3 = new AmazonS3Client();

async Task ListObjectsWithPrefixAsync(string bucketName, string prefix)
{
    try
    {
        var request = new ListObjectsV2Request
        {
            BucketName = bucketName,
            Prefix = prefix
        };

        var response = await s3.ListObjectsV2Async(request);

        if (response.S3Objects.Count > 0)
        {
            Console.WriteLine($"Objects with prefix '{prefix}':");
            foreach (var obj in response.S3Objects)
            {
                Console.WriteLine($"  • {obj.Key}");
            }
        }
        else
        {
            Console.WriteLine($"No objects with prefix '{prefix}'");
        }
    }
    catch (AmazonS3Exception e)
    {
        Console.WriteLine($"List error: {e.Message}");
    }
}
```

### List Objects with Pagination

```csharp
using Amazon.S3;
using Amazon.S3.Model;

using var s3 = new AmazonS3Client();

async Task ListObjectsPaginatedAsync(string bucketName)
{
    try
    {
        var request = new ListObjectsV2Request { BucketName = bucketName };
        int totalObjects = 0;

        ListObjectsV2Response response;
        do
        {
            response = await s3.ListObjectsV2Async(request);

            foreach (var obj in response.S3Objects)
            {
                Console.WriteLine($"  • {obj.Key}");
                totalObjects++;
            }

            request.ContinuationToken = response.NextContinuationToken;
        }
        while (response.IsTruncated);

        Console.WriteLine($"\nTotal objects: {totalObjects}");
    }
    catch (AmazonS3Exception e)
    {
        Console.WriteLine($"List error: {e.Message}");
    }
}
```

### List Objects with Paginator (SDK v3 Helper)

```csharp
using Amazon.S3;
using Amazon.S3.Model;

using var s3 = new AmazonS3Client();

async Task ListObjectsWithPaginatorAsync(string bucketName)
{
    var paginator = s3.Paginators.ListObjectsV2(
        new ListObjectsV2Request { BucketName = bucketName }
    );

    int totalObjects = 0;

    await foreach (var obj in paginator.S3Objects)
    {
        Console.WriteLine($"  • {obj.Key} ({obj.Size} bytes)");
        totalObjects++;
    }

    Console.WriteLine($"\nTotal objects: {totalObjects}");
}
```

### List Objects with Max Keys

```csharp
using Amazon.S3;
using Amazon.S3.Model;

using var s3 = new AmazonS3Client();

async Task ListObjectsLimitedAsync(string bucketName, int maxKeys = 10)
{
    try
    {
        var request = new ListObjectsV2Request
        {
            BucketName = bucketName,
            MaxKeys = maxKeys
        };

        var response = await s3.ListObjectsV2Async(request);

        foreach (var obj in response.S3Objects)
        {
            Console.WriteLine($"  • {obj.Key}");
        }

        Console.WriteLine($"\nShowing {response.S3Objects.Count} objects");
        Console.WriteLine($"More available: {response.IsTruncated}");
    }
    catch (AmazonS3Exception e)
    {
        Console.WriteLine($"List error: {e.Message}");
    }
}
```

### List Objects in Folder Structure

```csharp
using Amazon.S3;
using Amazon.S3.Model;

using var s3 = new AmazonS3Client();

async Task ListFolderAsync(string bucketName, string prefix = "")
{
    try
    {
        var request = new ListObjectsV2Request
        {
            BucketName = bucketName,
            Prefix = prefix,
            Delimiter = "/"
        };

        var response = await s3.ListObjectsV2Async(request);

        // List folders (common prefixes)
        if (response.CommonPrefixes.Count > 0)
        {
            Console.WriteLine("Folders:");
            foreach (var cp in response.CommonPrefixes)
            {
                Console.WriteLine($"  [DIR] {cp}");
            }
        }

        // List files
        if (response.S3Objects.Count > 0)
        {
            Console.WriteLine("\nFiles:");
            foreach (var obj in response.S3Objects)
            {
                Console.WriteLine($"  [FILE] {obj.Key}");
            }
        }
    }
    catch (AmazonS3Exception e)
    {
        Console.WriteLine($"List error: {e.Message}");
    }
}
```

### List with Filter

```csharp
using Amazon.S3;
using Amazon.S3.Model;

using var s3 = new AmazonS3Client();

async Task ListObjectsFilteredAsync(string bucketName, string extension)
{
    try
    {
        var paginator = s3.Paginators.ListObjectsV2(
            new ListObjectsV2Request { BucketName = bucketName }
        );

        await foreach (var obj in paginator.S3Objects)
        {
            if (obj.Key.EndsWith(extension, StringComparison.OrdinalIgnoreCase))
            {
                Console.WriteLine($"  • {obj.Key}");
            }
        }
    }
    catch (AmazonS3Exception e)
    {
        Console.WriteLine($"List error: {e.Message}");
    }
}

// Usage
await ListObjectsFilteredAsync("my-bucket", ".jpg");
```

---

## Delete Operations

### Delete Single Object

```csharp
using Amazon.S3;
using Amazon.S3.Model;

using var s3 = new AmazonS3Client();

async Task DeleteObjectAsync(string bucketName, string key)
{
    try
    {
        await s3.DeleteObjectAsync(bucketName, key);
        Console.WriteLine($"Deleted: {key}");
    }
    catch (AmazonS3Exception e)
    {
        Console.WriteLine($"Delete error: {e.Message}");
    }
}
```

### Delete Multiple Objects (Batch)

```csharp
using Amazon.S3;
using Amazon.S3.Model;

using var s3 = new AmazonS3Client();

async Task DeleteMultipleObjectsAsync(string bucketName, List<string> keys)
{
    try
    {
        var request = new DeleteObjectsRequest
        {
            BucketName = bucketName,
            Objects = keys.Select(k => new KeyVersion { Key = k }).ToList()
        };

        var response = await s3.DeleteObjectsAsync(request);

        Console.WriteLine($"Deleted {response.DeletedObjects.Count} objects:");
        foreach (var obj in response.DeletedObjects)
        {
            Console.WriteLine($"  • {obj.Key}");
        }

        if (response.DeleteErrors.Count > 0)
        {
            Console.WriteLine("Errors:");
            foreach (var error in response.DeleteErrors)
            {
                Console.WriteLine($"  • {error.Key}: {error.Message}");
            }
        }
    }
    catch (AmazonS3Exception e)
    {
        Console.WriteLine($"Batch delete error: {e.Message}");
    }
}

// Usage
await DeleteMultipleObjectsAsync("my-bucket", new List<string> { "file1.txt", "file2.txt", "file3.txt" });
```

### Delete All Objects with Prefix

```csharp
using Amazon.S3;
using Amazon.S3.Model;

using var s3 = new AmazonS3Client();

async Task DeleteObjectsWithPrefixAsync(string bucketName, string prefix)
{
    try
    {
        var listRequest = new ListObjectsV2Request
        {
            BucketName = bucketName,
            Prefix = prefix
        };

        var listResponse = await s3.ListObjectsV2Async(listRequest);

        if (listResponse.S3Objects.Count == 0)
        {
            Console.WriteLine("No objects to delete");
            return;
        }

        var deleteRequest = new DeleteObjectsRequest
        {
            BucketName = bucketName,
            Objects = listResponse.S3Objects.Select(o => new KeyVersion { Key = o.Key }).ToList()
        };

        await s3.DeleteObjectsAsync(deleteRequest);
        Console.WriteLine($"Deleted {listResponse.S3Objects.Count} objects with prefix '{prefix}'");
    }
    catch (AmazonS3Exception e)
    {
        Console.WriteLine($"Delete error: {e.Message}");
    }
}
```

### Delete All Objects in Bucket

```csharp
using Amazon.S3;
using Amazon.S3.Model;

using var s3 = new AmazonS3Client();

async Task EmptyBucketAsync(string bucketName)
{
    try
    {
        var request = new ListObjectsV2Request { BucketName = bucketName };

        ListObjectsV2Response response;
        do
        {
            response = await s3.ListObjectsV2Async(request);

            if (response.S3Objects.Count > 0)
            {
                var deleteRequest = new DeleteObjectsRequest
                {
                    BucketName = bucketName,
                    Objects = response.S3Objects.Select(o => new KeyVersion { Key = o.Key }).ToList()
                };

                await s3.DeleteObjectsAsync(deleteRequest);
            }

            request.ContinuationToken = response.NextContinuationToken;
        }
        while (response.IsTruncated);

        Console.WriteLine($"Emptied bucket: {bucketName}");
    }
    catch (AmazonS3Exception e)
    {
        Console.WriteLine($"Empty error: {e.Message}");
    }
}
```

### Empty and Delete Bucket

```csharp
using Amazon.S3;
using Amazon.S3.Model;

using var s3 = new AmazonS3Client();

async Task EmptyAndDeleteBucketAsync(string bucketName)
{
    try
    {
        // Delete all objects
        await EmptyBucketAsync(bucketName);
        Console.WriteLine("Deleted all objects");

        // Delete all object versions (if versioning enabled)
        var versionsRequest = new ListVersionsRequest { BucketName = bucketName };
        ListVersionsResponse versionsResponse;
        do
        {
            versionsResponse = await s3.ListVersionsAsync(versionsRequest);

            if (versionsResponse.Versions.Count > 0)
            {
                var deleteRequest = new DeleteObjectsRequest
                {
                    BucketName = bucketName,
                    Objects = versionsResponse.Versions
                        .Select(v => new KeyVersion { Key = v.Key, VersionId = v.VersionId })
                        .ToList()
                };

                await s3.DeleteObjectsAsync(deleteRequest);
            }

            versionsRequest.KeyMarker = versionsResponse.NextKeyMarker;
            versionsRequest.VersionIdMarker = versionsResponse.NextVersionIdMarker;
        }
        while (versionsResponse.IsTruncated);

        Console.WriteLine("Deleted all object versions");

        // Delete bucket
        await s3.DeleteBucketAsync(bucketName);
        Console.WriteLine($"Deleted bucket: {bucketName}");
    }
    catch (AmazonS3Exception e)
    {
        Console.WriteLine($"Error: {e.Message}");
    }
}
```

---

## Copy and Move Operations

### Copy Object

```csharp
using Amazon.S3;
using Amazon.S3.Model;

using var s3 = new AmazonS3Client();

async Task CopyObjectAsync(string sourceBucket, string sourceKey, string destBucket, string destKey)
{
    try
    {
        var request = new CopyObjectRequest
        {
            SourceBucket = sourceBucket,
            SourceKey = sourceKey,
            DestinationBucket = destBucket,
            DestinationKey = destKey
        };

        await s3.CopyObjectAsync(request);
        Console.WriteLine($"Copied {sourceKey} to {destKey}");
    }
    catch (AmazonS3Exception e)
    {
        Console.WriteLine($"Copy error: {e.Message}");
    }
}
```

### Copy with Metadata

```csharp
using Amazon.S3;
using Amazon.S3.Model;

using var s3 = new AmazonS3Client();

async Task CopyWithMetadataAsync(string sourceBucket, string sourceKey, string destBucket, string destKey)
{
    try
    {
        var request = new CopyObjectRequest
        {
            SourceBucket = sourceBucket,
            SourceKey = sourceKey,
            DestinationBucket = destBucket,
            DestinationKey = destKey,
            MetadataDirective = S3MetadataDirective.REPLACE
        };

        request.Metadata.Add("copied-from", sourceKey);
        request.Metadata.Add("copied-date", DateTime.UtcNow.ToString("yyyy-MM-dd"));

        await s3.CopyObjectAsync(request);
        Console.WriteLine("Copied with new metadata");
    }
    catch (AmazonS3Exception e)
    {
        Console.WriteLine($"Copy error: {e.Message}");
    }
}
```

### Move Object (Copy + Delete)

```csharp
using Amazon.S3;
using Amazon.S3.Model;

using var s3 = new AmazonS3Client();

async Task MoveObjectAsync(string sourceBucket, string sourceKey, string destBucket, string destKey)
{
    try
    {
        // Copy
        var copyRequest = new CopyObjectRequest
        {
            SourceBucket = sourceBucket,
            SourceKey = sourceKey,
            DestinationBucket = destBucket,
            DestinationKey = destKey
        };

        await s3.CopyObjectAsync(copyRequest);

        // Delete source
        await s3.DeleteObjectAsync(sourceBucket, sourceKey);

        Console.WriteLine($"Moved {sourceKey} to {destKey}");
    }
    catch (AmazonS3Exception e)
    {
        Console.WriteLine($"Move error: {e.Message}");
    }
}
```

---

## Presigned URLs

### Presigned URL for Download (GET)

```csharp
using Amazon.S3;
using Amazon.S3.Model;

using var s3 = new AmazonS3Client();

string? CreatePresignedDownloadUrl(string bucketName, string key, int expirationMinutes = 60)
{
    try
    {
        var request = new GetPreSignedUrlRequest
        {
            BucketName = bucketName,
            Key = key,
            Expires = DateTime.UtcNow.AddMinutes(expirationMinutes),
            Verb = HttpVerb.GET
        };

        return s3.GetPreSignedURL(request);
    }
    catch (AmazonS3Exception e)
    {
        Console.WriteLine($"Presigned URL error: {e.Message}");
        return null;
    }
}

// Usage
var url = CreatePresignedDownloadUrl("my-bucket", "file.pdf", 60);
Console.WriteLine($"Download URL: {url}");
```

### Presigned URL for Upload (PUT)

```csharp
using Amazon.S3;
using Amazon.S3.Model;

using var s3 = new AmazonS3Client();

string? CreatePresignedUploadUrl(string bucketName, string key, int expirationMinutes = 60)
{
    try
    {
        var request = new GetPreSignedUrlRequest
        {
            BucketName = bucketName,
            Key = key,
            Expires = DateTime.UtcNow.AddMinutes(expirationMinutes),
            Verb = HttpVerb.PUT
        };

        return s3.GetPreSignedURL(request);
    }
    catch (AmazonS3Exception e)
    {
        Console.WriteLine($"Presigned URL error: {e.Message}");
        return null;
    }
}

// Usage with HttpClient
var uploadUrl = CreatePresignedUploadUrl("my-bucket", "upload.txt");

if (uploadUrl is not null)
{
    using var httpClient = new HttpClient();
    var fileBytes = await File.ReadAllBytesAsync("file.txt");
    var response = await httpClient.PutAsync(uploadUrl, new ByteArrayContent(fileBytes));
    Console.WriteLine($"Upload status: {response.StatusCode}");
}
```

### Presigned URL with Content Type

```csharp
using Amazon.S3;
using Amazon.S3.Model;

using var s3 = new AmazonS3Client();

string? CreatePresignedUrlWithType(string bucketName, string key, string contentType, int expirationMinutes = 60)
{
    try
    {
        var request = new GetPreSignedUrlRequest
        {
            BucketName = bucketName,
            Key = key,
            Expires = DateTime.UtcNow.AddMinutes(expirationMinutes),
            Verb = HttpVerb.PUT,
            ContentType = contentType
        };

        return s3.GetPreSignedURL(request);
    }
    catch (AmazonS3Exception e)
    {
        Console.WriteLine($"Presigned URL error: {e.Message}");
        return null;
    }
}
```

---

## Multipart Upload

### Automatic Multipart Upload with TransferUtility (Recommended)

```csharp
using Amazon.S3;
using Amazon.S3.Transfer;

using var s3 = new AmazonS3Client();
using var transferUtility = new TransferUtility(s3);

async Task MultipartUploadAsync(string filePath, string bucketName, string key)
{
    try
    {
        var request = new TransferUtilityUploadRequest
        {
            BucketName = bucketName,
            Key = key,
            FilePath = filePath,
            PartSize = 25 * 1024 * 1024, // 25 MB
            ConcurrentServiceRequests = 10
        };

        await transferUtility.UploadAsync(request);
        Console.WriteLine($"Multipart upload complete: {key}");
    }
    catch (AmazonS3Exception e)
    {
        Console.WriteLine($"Upload error: {e.Message}");
    }
}
```

### Multipart Upload with Progress Callback

```csharp
using Amazon.S3;
using Amazon.S3.Transfer;

using var s3 = new AmazonS3Client();
using var transferUtility = new TransferUtility(s3);

async Task MultipartUploadWithProgressAsync(string filePath, string bucketName, string key)
{
    try
    {
        var request = new TransferUtilityUploadRequest
        {
            BucketName = bucketName,
            Key = key,
            FilePath = filePath,
            PartSize = 25 * 1024 * 1024
        };

        request.UploadProgressEvent += (sender, args) =>
        {
            Console.Write(
                $"\r{filePath}: {args.TransferredBytes} / {args.TotalBytes} ({args.PercentDone}%)"
            );
        };

        await transferUtility.UploadAsync(request);
        Console.WriteLine($"\nUpload complete: {key}");
    }
    catch (AmazonS3Exception e)
    {
        Console.WriteLine($"Upload error: {e.Message}");
    }
}
```

### Manual Multipart Upload (Low-Level)

```csharp
using Amazon.S3;
using Amazon.S3.Model;

using var s3 = new AmazonS3Client();

async Task ManualMultipartUploadAsync(string filePath, string bucketName, string key)
{
    string? uploadId = null;

    try
    {
        // Step 1: Initiate multipart upload
        var initiateResponse = await s3.InitiateMultipartUploadAsync(
            new InitiateMultipartUploadRequest
            {
                BucketName = bucketName,
                Key = key
            }
        );
        uploadId = initiateResponse.UploadId;

        // Step 2: Upload parts
        var parts = new List<PartETag>();
        int chunkSize = 10 * 1024 * 1024; // 10 MB
        int partNumber = 1;

        await using var fileStream = File.OpenRead(filePath);
        var buffer = new byte[chunkSize];
        int bytesRead;

        while ((bytesRead = await fileStream.ReadAsync(buffer)) > 0)
        {
            using var partStream = new MemoryStream(buffer, 0, bytesRead);

            var uploadPartResponse = await s3.UploadPartAsync(new UploadPartRequest
            {
                BucketName = bucketName,
                Key = key,
                PartNumber = partNumber,
                UploadId = uploadId,
                InputStream = partStream
            });

            parts.Add(new PartETag(partNumber, uploadPartResponse.ETag));
            Console.WriteLine($"Uploaded part {partNumber}");
            partNumber++;
        }

        // Step 3: Complete multipart upload
        await s3.CompleteMultipartUploadAsync(new CompleteMultipartUploadRequest
        {
            BucketName = bucketName,
            Key = key,
            UploadId = uploadId,
            PartETags = parts
        });

        Console.WriteLine($"Multipart upload complete: {key}");
    }
    catch (Exception e)
    {
        // Abort multipart upload on error
        if (uploadId is not null)
        {
            await s3.AbortMultipartUploadAsync(new AbortMultipartUploadRequest
            {
                BucketName = bucketName,
                Key = key,
                UploadId = uploadId
            });
        }

        Console.WriteLine($"Upload error: {e.Message}");
    }
}
```

### List In-Progress Multipart Uploads

```csharp
using Amazon.S3;
using Amazon.S3.Model;

using var s3 = new AmazonS3Client();

async Task ListMultipartUploadsAsync(string bucketName)
{
    try
    {
        var response = await s3.ListMultipartUploadsAsync(
            new ListMultipartUploadsRequest { BucketName = bucketName }
        );

        if (response.MultipartUploads.Count > 0)
        {
            Console.WriteLine("In-progress uploads:");
            foreach (var upload in response.MultipartUploads)
            {
                Console.WriteLine($"  • {upload.Key} (ID: {upload.UploadId})");
            }
        }
        else
        {
            Console.WriteLine("No in-progress uploads");
        }
    }
    catch (AmazonS3Exception e)
    {
        Console.WriteLine($"List error: {e.Message}");
    }
}
```

### Abort Multipart Upload

```csharp
using Amazon.S3;
using Amazon.S3.Model;

using var s3 = new AmazonS3Client();

async Task AbortMultipartUploadAsync(string bucketName, string key, string uploadId)
{
    try
    {
        await s3.AbortMultipartUploadAsync(new AbortMultipartUploadRequest
        {
            BucketName = bucketName,
            Key = key,
            UploadId = uploadId
        });

        Console.WriteLine($"Aborted upload: {key}");
    }
    catch (AmazonS3Exception e)
    {
        Console.WriteLine($"Abort error: {e.Message}");
    }
}
```

---

## Object Tagging

### Put Object Tags

```csharp
using Amazon.S3;
using Amazon.S3.Model;

using var s3 = new AmazonS3Client();

async Task TagObjectAsync(string bucketName, string key, Dictionary<string, string> tags)
{
    try
    {
        var request = new PutObjectTaggingRequest
        {
            BucketName = bucketName,
            Key = key,
            Tagging = new Tagging
            {
                TagSet = tags.Select(t => new Tag { Key = t.Key, Value = t.Value }).ToList()
            }
        };

        await s3.PutObjectTaggingAsync(request);
        Console.WriteLine($"Tagged {key}");
    }
    catch (AmazonS3Exception e)
    {
        Console.WriteLine($"Tagging error: {e.Message}");
    }
}

// Usage
await TagObjectAsync("my-bucket", "file.txt", new Dictionary<string, string>
{
    ["Environment"] = "Production",
    ["Department"] = "Engineering"
});
```

### Get Object Tags

```csharp
using Amazon.S3;
using Amazon.S3.Model;

using var s3 = new AmazonS3Client();

async Task<List<Tag>?> GetObjectTagsAsync(string bucketName, string key)
{
    try
    {
        var response = await s3.GetObjectTaggingAsync(
            new GetObjectTaggingRequest { BucketName = bucketName, Key = key }
        );

        Console.WriteLine("Tags:");
        foreach (var tag in response.Tagging)
        {
            Console.WriteLine($"  {tag.Key}: {tag.Value}");
        }

        return response.Tagging;
    }
    catch (AmazonS3Exception e)
    {
        Console.WriteLine($"Get tags error: {e.Message}");
        return null;
    }
}
```

### Delete Object Tags

```csharp
using Amazon.S3;
using Amazon.S3.Model;

using var s3 = new AmazonS3Client();

async Task DeleteObjectTagsAsync(string bucketName, string key)
{
    try
    {
        await s3.DeleteObjectTaggingAsync(
            new DeleteObjectTaggingRequest { BucketName = bucketName, Key = key }
        );
        Console.WriteLine($"Deleted tags from {key}");
    }
    catch (AmazonS3Exception e)
    {
        Console.WriteLine($"Delete tags error: {e.Message}");
    }
}
```

---

## Bucket Configuration

### Enable Versioning

```csharp
using Amazon.S3;
using Amazon.S3.Model;

using var s3 = new AmazonS3Client();

async Task EnableVersioningAsync(string bucketName)
{
    try
    {
        await s3.PutBucketVersioningAsync(new PutBucketVersioningRequest
        {
            BucketName = bucketName,
            VersioningConfig = new S3BucketVersioningConfig
            {
                Status = VersionStatus.Enabled
            }
        });
        Console.WriteLine($"Versioning enabled for {bucketName}");
    }
    catch (AmazonS3Exception e)
    {
        Console.WriteLine($"Versioning error: {e.Message}");
    }
}
```

### Get Versioning Status

```csharp
using Amazon.S3;
using Amazon.S3.Model;

using var s3 = new AmazonS3Client();

async Task<string> GetVersioningStatusAsync(string bucketName)
{
    try
    {
        var response = await s3.GetBucketVersioningAsync(
            new GetBucketVersioningRequest { BucketName = bucketName }
        );

        var status = response.VersioningConfig.Status?.Value ?? "Disabled";
        Console.WriteLine($"Versioning status: {status}");
        return status;
    }
    catch (AmazonS3Exception e)
    {
        Console.WriteLine($"Error: {e.Message}");
        return "Unknown";
    }
}
```

### Set Bucket CORS

```csharp
using Amazon.S3;
using Amazon.S3.Model;

using var s3 = new AmazonS3Client();

async Task SetBucketCorsAsync(string bucketName)
{
    try
    {
        var configuration = new CORSConfiguration
        {
            Rules = new List<CORSRule>
            {
                new CORSRule
                {
                    AllowedHeaders = new List<string> { "*" },
                    AllowedMethods = new List<string> { "GET", "PUT", "POST", "DELETE" },
                    AllowedOrigins = new List<string> { "*" },
                    ExposeHeaders = new List<string> { "ETag" },
                    MaxAgeSeconds = 3000
                }
            }
        };

        await s3.PutCORSConfigurationAsync(new PutCORSConfigurationRequest
        {
            BucketName = bucketName,
            Configuration = configuration
        });

        Console.WriteLine("CORS configured");
    }
    catch (AmazonS3Exception e)
    {
        Console.WriteLine($"CORS error: {e.Message}");
    }
}
```

### Get Bucket CORS

```csharp
using Amazon.S3;
using Amazon.S3.Model;

using var s3 = new AmazonS3Client();

async Task<CORSConfiguration?> GetBucketCorsAsync(string bucketName)
{
    try
    {
        var response = await s3.GetCORSConfigurationAsync(
            new GetCORSConfigurationRequest { BucketName = bucketName }
        );

        Console.WriteLine("CORS Rules:");
        foreach (var rule in response.Configuration.Rules)
        {
            Console.WriteLine($"  Methods: {string.Join(", ", rule.AllowedMethods)}");
            Console.WriteLine($"  Origins: {string.Join(", ", rule.AllowedOrigins)}");
        }

        return response.Configuration;
    }
    catch (AmazonS3Exception e)
    {
        Console.WriteLine($"Get CORS error: {e.Message}");
        return null;
    }
}
```

### Delete Bucket CORS

```csharp
using Amazon.S3;
using Amazon.S3.Model;

using var s3 = new AmazonS3Client();

async Task DeleteBucketCorsAsync(string bucketName)
{
    try
    {
        await s3.DeleteCORSConfigurationAsync(
            new DeleteCORSConfigurationRequest { BucketName = bucketName }
        );
        Console.WriteLine("CORS configuration deleted");
    }
    catch (AmazonS3Exception e)
    {
        Console.WriteLine($"Delete CORS error: {e.Message}");
    }
}
```

### Set Bucket Encryption

```csharp
using Amazon.S3;
using Amazon.S3.Model;

using var s3 = new AmazonS3Client();

async Task SetBucketEncryptionAsync(string bucketName)
{
    try
    {
        await s3.PutBucketEncryptionAsync(new PutBucketEncryptionRequest
        {
            BucketName = bucketName,
            ServerSideEncryptionConfiguration = new ServerSideEncryptionConfiguration
            {
                ServerSideEncryptionRules = new List<ServerSideEncryptionRule>
                {
                    new ServerSideEncryptionRule
                    {
                        ServerSideEncryptionByDefault = new ServerSideEncryptionByDefault
                        {
                            ServerSideEncryptionAlgorithm = ServerSideEncryptionMethod.AES256
                        }
                    }
                }
            }
        });
        Console.WriteLine("Encryption enabled");
    }
    catch (AmazonS3Exception e)
    {
        Console.WriteLine($"Encryption error: {e.Message}");
    }
}
```

### Set Bucket Lifecycle Policy

```csharp
using Amazon.S3;
using Amazon.S3.Model;

using var s3 = new AmazonS3Client();

async Task SetLifecyclePolicyAsync(string bucketName)
{
    try
    {
        await s3.PutLifecycleConfigurationAsync(new PutLifecycleConfigurationRequest
        {
            BucketName = bucketName,
            Configuration = new LifecycleConfiguration
            {
                Rules = new List<LifecycleRule>
                {
                    new LifecycleRule
                    {
                        Id = "DeleteOldObjects",
                        Status = LifecycleRuleStatus.Enabled,
                        Expiration = new LifecycleRuleExpiration { Days = 90 },
                        Filter = new LifecycleFilter
                        {
                            LifecycleFilterPredicate = new LifecyclePrefixPredicate { Prefix = "logs/" }
                        }
                    }
                }
            }
        });
        Console.WriteLine("Lifecycle policy configured");
    }
    catch (AmazonS3Exception e)
    {
        Console.WriteLine($"Lifecycle error: {e.Message}");
    }
}
```

---

## Waiters

### Wait Until Object Exists

```csharp
using Amazon.S3;
using Amazon.S3.Model;

using var s3 = new AmazonS3Client();

async Task WaitForObjectAsync(string bucketName, string key, CancellationToken ct = default)
{
    try
    {
        int maxAttempts = 20;
        var delay = TimeSpan.FromSeconds(5);

        for (int attempt = 0; attempt < maxAttempts; attempt++)
        {
            try
            {
                await s3.GetObjectMetadataAsync(bucketName, key, ct);
                Console.WriteLine($"Object exists: {key}");
                return;
            }
            catch (AmazonS3Exception e) when (e.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                await Task.Delay(delay, ct);
            }
        }

        Console.WriteLine($"Timeout waiting for object: {key}");
    }
    catch (AmazonS3Exception e)
    {
        Console.WriteLine($"Wait error: {e.Message}");
    }
}
```

### Wait Until Bucket Exists

```csharp
using Amazon.S3;
using Amazon.S3.Util;

using var s3 = new AmazonS3Client();

async Task WaitForBucketAsync(string bucketName, CancellationToken ct = default)
{
    try
    {
        int maxAttempts = 20;
        var delay = TimeSpan.FromSeconds(5);

        for (int attempt = 0; attempt < maxAttempts; attempt++)
        {
            if (await AmazonS3Util.DoesS3BucketExistV2Async(s3, bucketName))
            {
                Console.WriteLine($"Bucket exists: {bucketName}");
                return;
            }

            await Task.Delay(delay, ct);
        }

        Console.WriteLine($"Timeout waiting for bucket: {bucketName}");
    }
    catch (AmazonS3Exception e)
    {
        Console.WriteLine($"Wait error: {e.Message}");
    }
}
```

---

## Error Handling

### Common Error Types

```csharp
using Amazon.S3;
using Amazon.S3.Model;
using Amazon.Runtime;

using var s3 = new AmazonS3Client();

async Task<byte[]?> HandleErrorsAsync(string bucketName, string key)
{
    try
    {
        var response = await s3.GetObjectAsync(bucketName, key);
        using var ms = new MemoryStream();
        await response.ResponseStream.CopyToAsync(ms);
        return ms.ToArray();
    }
    catch (AmazonS3Exception e) when (e.ErrorCode == "NoSuchKey")
    {
        Console.WriteLine("Object not found");
    }
    catch (AmazonS3Exception e) when (e.ErrorCode == "NoSuchBucket")
    {
        Console.WriteLine("Bucket not found");
    }
    catch (AmazonS3Exception e) when (e.ErrorCode == "AccessDenied")
    {
        Console.WriteLine("Access denied");
    }
    catch (AmazonS3Exception e) when (e.ErrorCode == "InvalidAccessKeyId")
    {
        Console.WriteLine("Invalid credentials");
    }
    catch (AmazonClientException e)
    {
        Console.WriteLine($"AWS client error (no credentials?): {e.Message}");
    }
    catch (AmazonS3Exception e)
    {
        Console.WriteLine($"S3 error [{e.ErrorCode}]: {e.Message}");
    }

    return null;
}
```

### Retry Logic with Exponential Backoff

```csharp
using Amazon.S3;
using Amazon.S3.Model;

using var s3 = new AmazonS3Client();

async Task<byte[]?> DownloadWithRetryAsync(string bucketName, string key, int maxRetries = 3)
{
    for (int attempt = 0; attempt < maxRetries; attempt++)
    {
        try
        {
            var response = await s3.GetObjectAsync(bucketName, key);
            using var ms = new MemoryStream();
            await response.ResponseStream.CopyToAsync(ms);
            return ms.ToArray();
        }
        catch (AmazonS3Exception) when (attempt < maxRetries - 1)
        {
            var waitTime = TimeSpan.FromSeconds(Math.Pow(2, attempt));
            Console.WriteLine($"Attempt {attempt + 1} failed, retrying in {waitTime.TotalSeconds}s...");
            await Task.Delay(waitTime);
        }
    }

    return null;
}
```

### Custom Retry Configuration (SDK-Level)

```csharp
using Amazon.S3;
using Amazon.Runtime;

var config = new AmazonS3Config
{
    RegionEndpoint = Amazon.RegionEndpoint.USEast1,
    MaxErrorRetry = 10,
    RetryMode = RequestRetryMode.Adaptive
};

using var s3 = new AmazonS3Client(config);
```

---

## Complete Example: Full S3 Operations

```csharp
using Amazon.S3;
using Amazon.S3.Model;
using System.Text;

async Task MainAsync()
{
    using var s3 = new AmazonS3Client(Amazon.RegionEndpoint.USEast1);
    var bucketName = $"my-test-bucket-{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}";

    try
    {
        // 1. Create bucket
        Console.WriteLine("Creating bucket...");
        await s3.PutBucketAsync(bucketName);

        // 2. Upload object
        Console.WriteLine("Uploading object...");
        await s3.PutObjectAsync(new PutObjectRequest
        {
            BucketName = bucketName,
            Key = "test-file.txt",
            ContentBody = "Hello, S3!",
            ContentType = "text/plain"
        });

        // 3. Generate presigned URL
        Console.WriteLine("Generating presigned URL...");
        var url = s3.GetPreSignedURL(new GetPreSignedUrlRequest
        {
            BucketName = bucketName,
            Key = "test-file.txt",
            Expires = DateTime.UtcNow.AddHours(1),
            Verb = HttpVerb.GET
        });
        Console.WriteLine($"Presigned URL: {url}");

        // 4. Download object
        Console.WriteLine("Downloading object...");
        var response = await s3.GetObjectAsync(bucketName, "test-file.txt");
        using var reader = new StreamReader(response.ResponseStream);
        var content = await reader.ReadToEndAsync();
        Console.WriteLine($"Content: {content}");

        // 5. List objects
        Console.WriteLine("Listing objects...");
        var listResponse = await s3.ListObjectsV2Async(
            new ListObjectsV2Request { BucketName = bucketName }
        );
        foreach (var obj in listResponse.S3Objects)
        {
            Console.WriteLine($"  • {obj.Key}");
        }

        // 6. Delete object
        Console.WriteLine("Deleting object...");
        await s3.DeleteObjectAsync(bucketName, "test-file.txt");

        // 7. Delete bucket
        Console.WriteLine("Deleting bucket...");
        await s3.DeleteBucketAsync(bucketName);

        Console.WriteLine("Complete!");
    }
    catch (AmazonS3Exception e)
    {
        Console.WriteLine($"Error: {e.Message}");
    }
}

await MainAsync();
```
