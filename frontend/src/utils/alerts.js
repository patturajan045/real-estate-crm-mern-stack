import Swal from 'sweetalert2';

export function sanitizeUserMessage(msg) {
  if (!msg || typeof msg !== 'string') {
    return 'Unable to complete request. Please try again.';
  }
  const clean = msg.trim();
  if (clean.startsWith('{') || clean.startsWith('[') || clean.includes('[object')) {
    return 'An unexpected response was received. Please try again.';
  }
  if (
    clean.includes('Traceback') ||
    clean.includes('mongoengine') ||
    clean.includes('DoesNotExist') ||
    clean.includes('ValidationError') ||
    clean.includes('Exception:')
  ) {
    if (clean.toLowerCase().includes('already registered') || clean.toLowerCase().includes('already exists')) {
      return 'An account with this email already exists.';
    }
    if (clean.toLowerCase().includes('not found')) {
      return 'The requested record was not found.';
    }
    return 'Please verify your input values and try again.';
  }
  return clean;
}

export function alert(title, text = '', icon = 'info') {
  return Swal.fire({
    title,
    text: sanitizeUserMessage(text),
    icon,
    confirmButtonColor: '#2563eb',
  });
}

export function success(text, title = 'Success!') {
  return Swal.fire({
    title,
    text: sanitizeUserMessage(text),
    icon: 'success',
    confirmButtonColor: '#059669',
  });
}

export function error(text, title = 'Notice') {
  return Swal.fire({
    title,
    text: sanitizeUserMessage(text),
    icon: 'error',
    confirmButtonColor: '#dc2626',
  });
}

export function warning(text, title = 'Warning') {
  return Swal.fire({
    title,
    text,
    icon: 'warning',
    confirmButtonColor: '#d97706',
  });
}

export function confirm(title, text, confirmButtonText = 'Yes, proceed', icon = 'warning') {
  return Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonColor: '#2563eb',
    cancelButtonColor: '#64748b',
    confirmButtonText,
  }).then((res) => res.isConfirmed);
}

export function toast(message, icon = 'success') {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toastEl) => {
      toastEl.addEventListener('mouseenter', Swal.stopTimer);
      toastEl.addEventListener('mouseleave', Swal.resumeTimer);
    },
  });
  Toast.fire({
    icon,
    title: message,
  });
}
