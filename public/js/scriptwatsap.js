document.getElementById('rentalForm').addEventListener('submit', async function(e) {
    e.preventDefault();
  
    const form = e.target;
    const data = {
      rentalType: document.querySelector('input[name="rentalType"]:checked')?.id || '',
      carId: document.getElementById('carId').value,
      pickupLocation: form.pickupLocation.value,
      customPickupAddress: form.querySelector('#customPickupAddress input')?.value || '',
      dropoffLocation: document.getElementById('sameAsPickup').checked ? form.pickupLocation.value : form.dropoffLocation?.value,
      customDropoffAddress: form.querySelector('#customDropoffAddress input')?.value || '',
      pickupDate: form.pickupDate.value,
      pickupTime: form.pickupTime.value,
      returnDate: form.returnDate.value,
      returnTime: form.returnTime.value,
      driverLanguage: form.driverLanguage?.value || '',
      driverExperience: form.driverExperience?.value || '',
      specialRequests: form.specialRequests?.value || '',
      licenseNumber: form.licenseNumber?.value || '',
      licenseCountry: form.licenseCountry?.value || '',
      fullName: form.fullName.value,
      phoneNumber: form.phoneNumber.value,
      email: form.email.value,
      country: form.country.value
    };
  
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
  
      const result = await res.json();
      if (res.ok) {
        alert('Booking submitted successfully!');
        form.reset();
      } else {
        alert('Failed to submit booking: ' + result.error);
      }
    } catch (error) {
      console.error(error);
      alert('Something went wrong.');
    }
  });
  