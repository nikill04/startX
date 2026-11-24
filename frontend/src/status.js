// Badge colours (Tailwind classes) for the status of an EIR or grant application.
// Used by the startup, admin and reviewer pages so they all look the same.
export function getStatusColor(status) {
  switch (status) {
    case 'Approved': return 'bg-green-200 text-green-800';
    case 'Rejected': return 'bg-red-200 text-red-800';
    case 'Short Listed': return 'bg-blue-200 text-blue-800';
    case 'Under Review': return 'bg-purple-200 text-purple-800';
    default: return 'bg-gray-200 text-gray-800'; // "Submitted"
  }
}
