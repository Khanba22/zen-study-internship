import { Upload } from 'lucide-react'


export function UploadButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full shadow-lg flex items-center"
    >
      <Upload className="mr-2" />
      Admin Upload
    </button>
  )
}

