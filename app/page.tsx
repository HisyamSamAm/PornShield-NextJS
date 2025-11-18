import ImageUploadForm from './components/ImageUploadForm';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black py-12">
      <ImageUploadForm />
    </div>
  );
}
