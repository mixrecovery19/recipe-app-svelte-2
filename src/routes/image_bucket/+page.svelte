<script lang="ts">
    import { onMount } from "svelte";
    import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
    
    const client = new S3Client({
      region: 'ap-southeast-2', // Replace with your actual project region
      endpoint: 'https://ckzdwxkzhuehnecisehw.supabase.co/storage/v1/s3', // Replace 'project_ref' with your Supabase reference
      credentials: {
        accessKeyId: '9fed861625ed361afcebd6b31cda73e8', // Your S3 access key ID
        secretAccessKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNremR3eGt6aHVlaG5lY2lzZWh3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMjM4ODkxNiwiZXhwIjoyMDM3OTY0OTE2fQ.7EhsnYPNWSple0G9CfpqKWgrrR2Cm37wBpM0X4UeG5U', // Your S3 secret access key
      },
      forcePathStyle: true // Necessary for S3-compatible storage services like Supabase
    });
    
    let imageFile: File | null = null;
    
    // Function to handle file upload
    async function uploadImage() {
        if (imageFile) {
            const fileName = `${Date.now()}-${imageFile.name}`;
            
            const uploadParams = {
                Bucket: 'image_bucket', // The bucket name in Supabase
                Key: fileName, // The file name (key)
                Body: imageFile, // The file content
                ContentType: imageFile.type // The MIME type of the file
            };
    
            try {
                const data = await client.send(new PutObjectCommand(uploadParams));
                console.log('File uploaded successfully:', data);
            } catch (err) {
                console.error('Error uploading file:', err);
            }
        } else {
            console.warn('No image selected');
        }
    }
    
    // Handle file input change
    function handleFileChange(event: Event) {
        const target = event.target as HTMLInputElement;
        imageFile = target.files ? target.files[0] : null;
        console.log('Image selected:', imageFile?.name);
    }
    </script>
    
    <!-- HTML for file input and upload button -->
    <tr>
        <td><label for="r_recipes_image">Upload Image:</label></td>
        <td><input type="file" id="r_recipes_image" accept="image/*" on:change={handleFileChange} required></td>
    </tr>
    <button id="cr" type="submit" on:click={uploadImage}>
        Upload Image
    </button>
    