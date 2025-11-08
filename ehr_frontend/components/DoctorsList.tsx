import { useEffect, useState } from 'react';
import { apiCall } from '@/lib/api-client';

export default function DoctorsList() {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const data = await apiCall('/api/doctors');
        setDoctors(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchDoctors();
  }, []);

  return (
    <ul>
      {doctors.map((doc: any) => (
        <li key={doc.id}>{doc.name}</li>
      ))}
    </ul>
  );
}
