export const nameValidator = (value: string): string | false => {
  if (value.length < 2) {
    return 'Name must be at least 2 characters long';
  }
  if (value.length > 20) {
    return 'Name must be less than 20 characters long';
  }
  if (!/^[a-zA-Z ]+$/.test(value)) {
    return 'Name must contain only letters and spaces';
  }
  return false;
};

export const emailValidator = (value: string): string | false => {
  if (!/^[a-zA-Z0-9._:$!%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]+$/.test(value)) {
    return 'Invalid email address';
  }
  return false;
};

export const passwordValidator = (value: string): string | false => {
  if (value.length < 10) {
    return 'Password must be at least 10 characters long';
  }
  return false;
};


// TODO: Make validators better

export function ibanValidator(iban: string): string | false {
  const trimmed = iban.replace(/\s+/g, '').toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/.test(trimmed))
  {return 'Invalid IBAN format';}

  const rearranged = trimmed.slice(4) + trimmed.slice(0, 4);
  const converted = rearranged.replace(/[A-Z]/g, (ch) =>
    (ch.charCodeAt(0) - 55).toString()
  );

  let remainder = converted, block;
  while (remainder.length > 2) {
    block = remainder.slice(0, 9);
    remainder = (parseInt(block, 10) % 97).toString() + remainder.slice(block.length);
  }
  if (parseInt(remainder, 10) % 97 !== 1) {
    return 'Invalid IBAN checksum';
  }

  return false;
}

export function bicValidator(bic: string): string | false {
  if (!/^[A-Za-z]{4}[A-Za-z]{2}[A-Za-z0-9]{2}([A-Za-z0-9]{3})?$/.test(bic)) {
    return 'Invalid BIC format';
  }
  return false;
}

export function phoneValidator(phone: string): string | false {
  const phoneRegex = /^\+?[0-9\s-]{7,15}$/;
  if (!phoneRegex.test(phone)) {
    return 'Invalid phone number';
  }
  return false;
}

export function dateValidator(dateString: string): string | false {
  if (!dateString) {return 'Date is required';}
  const date = new Date(dateString);
  const now = new Date();
  if (isNaN(date.getTime())) {return 'Invalid date';}
  if (date >= now) {return 'Date must be in the past';}
  return false;
}

export function optionalValidatorLettersOnly(value: string): string | false {
  const validPattern = /^[a-zA-Z\s'-]*$/;
  return validPattern.test(value)
    ? false
    : 'Only letters, spaces, apostrophes, and hyphens are allowed';
}

export function optionalValidatorLettersAndNumbers(value: string): string | false {
  const validPattern = /^[a-zA-Z0-9\s'-]+$/;
  return validPattern.test(value)
    ? false
    : 'Only letters and numbers are allowed';
}

export function validatorLettersAndNumbers(value: string): string | false {
  const validPattern = /^[a-zA-Z0-9\s'-]+$/;
  if (!value) {
    return 'This field is required';
  }
  return validPattern.test(value)
    ? false
    : 'Only letters and numbers are allowed';
}

export function optionalValidatorNumbersOnly(value: string): string | false {
  const validPattern = /^[0-9]+$/;
  return validPattern.test(value)
    ? false
    : 'Only numbers are allowed';
}

// Have to improve this
export function addressValidator(value: string): string | false {
  if (value.trim() === '') {return 'Address is required';}

  const validPattern = /^[a-zA-Z0-9\s]+$/;
  return validPattern.test(value)
    ? false
    : 'Address contains invalid characters';
}

export function educationalInstitutionValidator(value: string): string | false {
  if (value.trim() === '') {
    return 'Educational institution is required';
  }

  const validPattern = /^[a-zA-Z\s'-]+$/;
  return validPattern.test(value)
    ? false
    : 'Only letters, spaces, apostrophes, and hyphens are allowed';
}

export function emergencyContactNameValidator(value: string): string | false {
  if (value.trim() === '') {
    return 'Emergency contact name is required';
  }

  const validPattern = /^[a-zA-Z\s'-]+$/;
  return validPattern.test(value)
    ? false
    : 'Only letters, spaces, apostrophes, and hyphens are allowed';
}