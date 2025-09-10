import { Language } from './types.ts';

export const nameValidator = (value: string): Language | false => {
  if (value.length < 2) {
    return {
      en: 'Name must be at least 2 characters long',
      nl: 'Naam moet ten minste 2 karakters lang zijn',
    };
  }
  if (value.length > 20) {
    return {
      en: 'Name must be less than 20 characters long',
      nl: 'Naam mag niet langer zijn dan 20 karakters',
    };
  }
  if (!/^[a-zA-Z ]+$/.test(value)) {
    return {
      en: 'Name must contain only letters and spaces',
      nl: 'Naam mag alleen letters en spaties bevatten',
    };
  }
  return false;
};

export const emailValidator = (value: string): Language | false => {
  if (!/^[a-zA-Z0-9._:$!%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]+$/.test(value)) {
    return {
      en: 'Invalid email address',
      nl: 'Ongeldig e-mailadres',
    };
  }
  return false;
};

export const passwordValidator = (value?: string): Language | false => {
  if (!value || value.length < 3) {
    return {
      en: 'Password must be at least 10 characters long',
      nl: 'Wachtwoord moet minimaal 10 karakters lang zijn',
    };
  }
  return false;
};

export const repeatPasswordValidator = (value?: string, value2?: string): Language | false => {
  if (value !== value2) {
    return {
      en: 'Password should match',
      nl: 'Wachtwoord moet overeenkomen',
    };
  }
  return false;
};

export function phoneValidator(phone: string): Language | false {
  const phoneRegex = /^\+?[0-9\s-]{7,15}$/;
  if (!phoneRegex.test(phone)) {
    return {
      en: 'Invalid phone number',
      nl: 'Ongeldig telefoonnummer',
    };
  }
  return false;
}

export function optionalOnlyLetterValidator(value?: string): Language | false {
  if (!value) {return false;}
  const validPattern = /^[a-zA-Z\s'-]*$/;
  return validPattern.test(value)
    ? false
    : {
      en: 'Only letters, spaces, apostrophes, and hyphens are allowed',
      nl: 'Alleen letters, spaties, apostroffen en koppeltekens zijn toegestaan',
    };
}

export function optionalOnlyLetterNumberValidator(value?: string): Language | false {
  if (!value) {return false;}
  const validPattern = /^[a-zA-Z0-9\s'-]*$/;
  return validPattern.test(value)
    ? false
    : {
      en: 'Only letters and numbers are allowed',
      nl: 'Alleen letters en cijfers zijn toegestaan',
    };
}

export function onlyNumbersValidator(value: string): Language | false {
  if (!value.trim() || value === 'NaN') {
    return {
      en: 'This field is required',
      nl: 'Dit veld is verplicht',
    };
  }
  const validPattern = /^[a-zA-Z0-9\s'-]+$/;
  return validPattern.test(value)
    ? false
    : {
      en: 'Only letters and numbers are allowed',
      nl: 'Alleen letters en cijfers zijn toegestaan',
    };
}

export function optionalValidatorNumbersOnly(value: string): Language | false {
  if (!value) {return false;}
  const validPattern = /^[0-9]+$/;
  return validPattern.test(value)
    ? false
    : {
      en: 'Only numbers are allowed',
      nl: 'Alleen cijfers zijn toegestaan',
    };
}

export function emergencyContactNameValidator(value: string): Language | false {
  if (!value.trim()) {
    return {
      en: 'Emergency contact name is required',
      nl: 'Naam van contactpersoon in noodgevallen is verplicht',
    };
  }

  const validPattern = /^[a-zA-Z\s'-]+$/;
  return validPattern.test(value)
    ? false
    : {
      en: 'Only letters, spaces, apostrophes, and hyphens are allowed',
      nl: 'Alleen letters, spaties, apostroffen en koppeltekens zijn toegestaan',
    };
}
