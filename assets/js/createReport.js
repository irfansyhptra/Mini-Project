const createReport = () => {
  // Get form element first to avoid scope issues
  const form = document.getElementById('laporan-form');
  if (!form) {
    console.error('Form not found in DOM');
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  const loadingOverlay = document.getElementById('loading-overlay');
  const token = localStorage.getItem('token');

  async function handleSubmit(event) {
    event.preventDefault();
    console.log('Form submission started');

    try {
      // Show loading state
      submitButton.disabled = true;
      if (loadingOverlay) loadingOverlay.classList.remove('hidden');

      // Get user data from localStorage
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData || !userData._id) {
        throw new Error('User data not found. Please login again.');
      }

      // Get all form elements by name/id to ensure they exist
      const titleInput = form.judul || form.querySelector('[name="judul"]');
      const descriptionInput = form.deskripsi || form.querySelector('[name="deskripsi"]');
      const kategoriInput = form.kategori || form.querySelector('[name="kategori"]');
      const addressInput = form['alamat-detail'] || form.querySelector('[name="alamat-detail"]');
      const fotoInput = form.foto || form.querySelector('[name="foto"]');
      const fotoTambahanInput = form['foto-tambahan'] || form.querySelector('[name="foto-tambahan"]');

      // Validate required fields
      if (!titleInput || !descriptionInput || !kategoriInput || !addressInput) {
        throw new Error('Form tidak lengkap atau ada elemen yang hilang dari DOM');
      }

      // Validate that required fields have values
      if (!titleInput.value.trim() || !descriptionInput.value.trim() || 
          !kategoriInput.value || !addressInput.value.trim()) {
        throw new Error('Semua kolom harus diisi');
      }

      // Validate image requirement
      const fotoFile = fotoInput?.files?.[0];
      const fotoTambahanFile = fotoTambahanInput?.files?.[0];
      
      if (!fotoFile && !fotoTambahanFile) {
        throw new Error('Minimal satu foto harus diunggah');
      }

      // Create FormData object for form data including files
      const formData = new FormData();
      
      // Append text fields with reporterID from userData
      formData.append('reporterID', userData._id);
      formData.append('title', titleInput.value.trim());
      formData.append('description', descriptionInput.value.trim());
      formData.append('kategori', kategoriInput.value);
      formData.append('address', addressInput.value.trim());
      
      // Append image files
      if (fotoFile) {
        formData.append('images', fotoFile);
      }
      
      if (fotoTambahanInput && fotoTambahanInput.files.length > 0) {
        for (let i = 0; i < fotoTambahanInput.files.length; i++) {
          formData.append('images', fotoTambahanInput.files[i]);
        }
      }

      console.log('Form data collected, sending to server');
      console.log('ReporterID:', userData._id); // Log the reporterID for debugging
      
      // Send report data to backend as FormData
      const response = await fetch('https://backend-silapor.vercel.app/report/createReport', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error(errorData.message || 'Failed to create report');
      }

      const responseData = await response.json();
      console.log('Success response:', responseData);

      // Show success message
      alert('Laporan berhasil dibuat!');

      // Redirect to LaporanSaya.html
      const baseUrl = window.location.origin + "/SILAPOR-FrontEnd";
      window.location.href = baseUrl + "/page/LaporanSaya.html";

    } catch (error) {
      console.error('Error submitting report:', error);
      alert(error.message || 'Terjadi kesalahan saat mengirim laporan. Silakan coba lagi.');
    } finally {
      // Hide loading state
      submitButton.disabled = false;
      if (loadingOverlay) loadingOverlay.classList.add('hidden');
    }
  }

  // Function to handle current location
  async function handleCurrentLocation() {
    const alamatDetail = document.getElementById('alamat-detail');
    
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;
      
      // Use geocoding service to get address
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
      const data = await response.json();
      
      if (data.display_name) {
        alamatDetail.value = data.display_name;
      } else {
        alamatDetail.value = `Koordinat: ${latitude}, ${longitude}`;
      }
    } catch (error) {
      console.error('Error getting location:', error);
      alert('Tidak dapat mengakses lokasi Anda. Silakan masukkan alamat secara manual.');
    }
  }

  // Directly attach event listeners here
  form.addEventListener('submit', handleSubmit);

  const locationButton = document.querySelector('button[type="button"]');
  if (locationButton) {
    locationButton.addEventListener('click', handleCurrentLocation);
  }

  // Handle success overlay close button
  const successCloseBtn = document.getElementById('success-close-btn');
  if (successCloseBtn) {
    successCloseBtn.addEventListener('click', () => {
      const successOverlay = document.getElementById('success-overlay');
      if (successOverlay) {
        successOverlay.classList.add('hidden');
        successOverlay.classList.remove('flex');
      }
    });
  }
}

// Call createReport when DOM is loaded
document.addEventListener('DOMContentLoaded', createReport);