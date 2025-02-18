document.addEventListener("DOMContentLoaded", function () {
  // Support Form Validation
  const supportForm = document.getElementById('supportForm');
  const supportCancelButton = document.getElementById('supportCancelButton');
  
  // Helper function to reset forms
  function resetForm(form) {
    form.reset();
    form.classList.remove('was-validated');
    const inputFields = form.querySelectorAll('input, select');
    inputFields.forEach(field => {
      field.classList.remove('is-valid', 'is-invalid');
    });
  }

  // Fetch countries from API with error handling
  const selectElement = document.getElementById('location');
  fetch('https://restcountries.com/v3.1/all')
    .then(response => response.json())
    .then(data => {
      const sortedCountries = data.sort((a, b) => a.name.common.localeCompare(b.name.common));
      selectElement.innerHTML = '<option value="" disabled selected>Select location</option>';
      sortedCountries.forEach(country => {
        const option = document.createElement('option');
        option.value = country.cca2;
        option.textContent = country.name.common;
        selectElement.appendChild(option);
      });
    })
    .catch(error => {
      console.error('Error fetching countries:', error);
      selectElement.innerHTML = '<option disabled>Error loading countries</option>';
    });

  supportForm.addEventListener('submit', function (event) {
    event.preventDefault();
    let isValid = validateSupportForm(); // Separate validation function

    if (isValid) {
      submitSupportForm(); // Separate form submission function
    }
  });

  function validateSupportForm() {
    let isValid = true;

    const emailField = document.getElementById('guestEmail');
    const emailPattern = /^(?!.*\.{2})(?!.*\.$)(?!^\.)(?!.*@\.)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(emailField.value)) {
      emailField.classList.add('is-invalid');
      isValid = false;
    } else {
      emailField.classList.remove('is-invalid');
    }

    const phoneField = document.getElementById('guestNumber');
    const phonePattern = /^(\+?\d{1,3}[- ]?)?\d{10}$/;
    if (!phonePattern.test(phoneField.value)) {
      phoneField.classList.add('is-invalid');
      isValid = false;
    } else {
      phoneField.classList.remove('is-invalid');
    }

    if (!supportForm.checkValidity()) {
      isValid = false;
    }

    if (!isValid) {
      supportForm.classList.add('was-validated');
    }
    return isValid;
  }

  function submitSupportForm() {
    const formData = new FormData(supportForm);
    fetch('https://formspree.io/f/mrbzwnbe', {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    }).then(response => {
      if (response.ok) {
        localStorage.setItem('formSubmitted', 'true');
        setTimeout(() => {
          const supportFormModal = bootstrap.Modal.getInstance(document.getElementById('supportModal'));
          supportFormModal.hide();
          const thankYouModal = new bootstrap.Modal(document.getElementById('thankYouModal'));
          thankYouModal.show();
        }, 1000);
        supportForm.reset();
        supportForm.classList.remove('was-validated');
      } else {
        alert('There was a problem submitting the form. Please try again.');
      }
    }).catch(error => {
      alert('There was a problem submitting the form. Please try again later.');
      console.error('Error:', error);
    });
  }

  supportCancelButton.addEventListener('click', function () {
    resetForm(supportForm);
  });

  document.querySelector('.navbar-toggler').addEventListener('click', () => {
    const modal = new bootstrap.Modal(document.getElementById('hamburgerModal'));
    modal.show();
  });
})