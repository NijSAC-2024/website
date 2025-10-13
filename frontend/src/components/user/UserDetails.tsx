import { FormEvent, useEffect, useState } from 'react';
import { TextField, Button, Box, FormControl } from '@mui/material';
import {Language, toUserContent, UserContent} from '../../types';
import { FormErrors } from '../signup/SignupForm';
import { useApiState } from '../../providers/ApiProvider';
import { useLanguage } from '../../providers/LanguageProvider';
import { useAuth } from '../../providers/AuthProvider';
import {
  emailValidator, emergencyContactNameValidator, nameValidator,
  onlyNumbersValidator, optionalOnlyLetterNumberValidator, optionalOnlyLetterValidator, phoneValidator
} from '../../validator';
import ContentCard from '../ContentCard.tsx';
import TextCard from '../TextCard.tsx';
import {getLabel, isAdminOrBoard} from '../../util.ts';
import {useAppState} from '../../providers/AppStateProvider.tsx';
import UserActions from './UserActions.tsx';

export default function UserDetails() {
  const { text } = useLanguage();
  const { user } = useAuth();
  const { updateUser, getUser } = useApiState();
  const { route } = useAppState()
  const [viewUser, setViewUser] = useState(user);
  const [form, setForm] = useState<UserContent>(toUserContent(user));
  const [errors, setErrors] = useState<FormErrors>({
    firstName: false,
    infix: false,
    lastName: false,
    phone: false,
    email: false,
    password: false,
    studentNumber: false,
    sportcardNumber: false,
    nkbvNumber: false,
    iceContactName: false,
    iceContactEmail: false,
    iceContactPhone: false,
    importantInfo: false,
  });

  const isMe = route.params!.id === user?.id
  const canEdit = isAdminOrBoard(user) || isMe


  useEffect(() => {
    if (!isMe && !!user) {
      getUser(route.params!.id).then((u) => {
        if (u) {
          setViewUser(u);
          setForm(toUserContent(u));
        }
      });
    } else if (user) {
      setViewUser(user);
      setForm(toUserContent(user));
    }
  }, [getUser, isMe, route.params, user]);

  const handleChange = (field: keyof UserContent, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateInputs = () => {
    setErrors({
      firstName: nameValidator(form.firstName),
      infix: optionalOnlyLetterValidator(form.infix),
      lastName: nameValidator(form.lastName),
      phone: phoneValidator(form.phone),
      email: emailValidator(form.email),
      importantInfo: optionalOnlyLetterNumberValidator(form.importantInfo),
      studentNumber: onlyNumbersValidator(form.studentNumber.toString()),
      sportcardNumber: onlyNumbersValidator(form.sportcardNumber.toString()),
      nkbvNumber: onlyNumbersValidator(form.nkbvNumber.toString()),
      iceContactName: emergencyContactNameValidator(form.iceContactName),
      iceContactEmail: emailValidator(form.iceContactEmail),
      iceContactPhone: phoneValidator(form.iceContactPhone),
      password: false,
    });
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    if (!canEdit || !viewUser) {return;}
    if (Object.values(errors).some((v) => v)) {return;}
    await updateUser(viewUser.id, { ...viewUser, ...form });
  };

  if (!viewUser) {return null;}

  return (
    <ContentCard className="grid gap-1">
      <div className="flex justify-between w-full">
        <h1>{isMe? text('My account', 'Mijn account') : `${viewUser.firstName.charAt(0).toUpperCase() + viewUser.firstName.slice(1)}'s account`}</h1>
        <UserActions />
      </div>

      {canEdit ? (
        <Box component="form" onSubmit={handleSave}>
          {/* Personal information */}
          <h2>{text('Personal information', 'Persoonlijke informatie')}</h2>
          <TextCard className="px-3 xl:px-6 py-3 grid xl:grid-cols-4 gap-2 xl:gap-5 mb-3 items-center">
            <b>{text('First name', 'Voornaam')}</b>
            <FormControl className="xl:col-span-3">
              <TextField 
                disabled={!isAdminOrBoard(user)}
                size="small"
                value={form.firstName}
                fullWidth
                onChange={(e) => handleChange('firstName', e.target.value)}
                error={!!errors.firstName}
                helperText={errors.firstName && text(errors.firstName as Language)}
              />
            </FormControl>

            <b>{text('Infix', 'Tussenvoegsel')}</b>
            <FormControl className="xl:col-span-3">
              <TextField
                disabled={!isAdminOrBoard(user)}
                size="small"
                value={form.infix}
                fullWidth
                onChange={(e) => handleChange('infix', e.target.value)}
                error={!!errors.infix}
                helperText={errors.infix && text(errors.infix as Language)}
              />
            </FormControl>

            <b>{text('Last name', 'Achternaam')}</b>
            <FormControl className="xl:col-span-3">
              <TextField
                disabled={!isAdminOrBoard(user)}
                size="small"
                value={form.lastName}
                fullWidth
                onChange={(e) => handleChange('lastName', e.target.value)}
                error={!!errors.lastName}
                helperText={errors.lastName && text(errors.lastName as Language)}
              />
            </FormControl>

            <b>{text('Phone number', 'Telefoonnummer')}</b>
            <FormControl className="xl:col-span-3">
              <TextField
                size="small"
                value={form.phone}
                fullWidth
                onChange={(e) => handleChange('phone', e.target.value)}
                error={!!errors.phone}
                helperText={errors.phone && text(errors.phone as Language)}
              />
            </FormControl>

            <b>{text('Email', 'E-mailadres')}</b>
            <FormControl className="xl:col-span-3">
              <TextField
                size="small"
                value={form.email}
                fullWidth
                onChange={(e) => handleChange('email', e.target.value)}
                error={!!errors.email}
                helperText={errors.email && text(errors.email as Language)}
              />
            </FormControl>

            <b>{text('Important information', 'Belangrijke informatie')}</b>
            <FormControl className="xl:col-span-3">
              <TextField
                size="small"
                value={form.importantInfo}
                fullWidth
                onChange={(e) => handleChange('importantInfo', e.target.value)}
                error={!!errors.importantInfo}
                helperText={errors.importantInfo && text(errors.importantInfo as Language)}
              />
            </FormControl>

            <b>{text('Membership status', 'Lidmaatschapsstatus')}</b>
            <span className="xl:col-span-3">{text(getLabel(viewUser.status))}</span>

            <b>{text('Roles', 'Rollen')}</b>
            <span className="xl:col-span-3">
              {viewUser.roles.map((r) => text(getLabel(r))).join(', ')}
            </span>
          </TextCard>

          {/* Education & Insurance */}
          <h2>{text('Education & Insurance', 'Educatie & Verzekering')}</h2>
          <TextCard className="px-3 xl:px-6 py-3 grid xl:grid-cols-4 gap-2 xl:gap-5 mb-3 items-center">
            <b>{text('Student number', 'Studentnummer')}</b>
            <FormControl className="xl:col-span-3">
              <TextField
                size="small"
                type="number"
                value={form.studentNumber}
                fullWidth
                onChange={(e) => handleChange('studentNumber', parseInt(e.target.value) || 0)}
                error={!!errors.studentNumber}
                helperText={errors.studentNumber && text(errors.studentNumber as Language)}
              />
            </FormControl>

            <b>{text('Sportscard number', 'Sportkaartnummer')}</b>
            <FormControl className="xl:col-span-3">
              <TextField
                size="small"
                type="number"
                value={form.sportcardNumber}
                fullWidth
                onChange={(e) => handleChange('sportcardNumber', parseInt(e.target.value) || 0)}
                error={!!errors.sportcardNumber}
                helperText={errors.sportcardNumber && text(errors.sportcardNumber as Language)}
              />
            </FormControl>

            <b>{text('NKBV number', 'NKBV-nummer')}</b>
            <FormControl className="xl:col-span-3">
              <TextField
                size="small"
                type="number"
                value={form.nkbvNumber}
                fullWidth
                onChange={(e) => handleChange('nkbvNumber', parseInt(e.target.value) || 0)}
                error={!!errors.nkbvNumber}
                helperText={errors.nkbvNumber && text(errors.nkbvNumber as Language)}
              />
            </FormControl>
          </TextCard>

          {/* Emergency contact */}
          <h2>{text('Emergency contact', 'Contact noodgevallen')}</h2>
          <TextCard className="px-3 xl:px-6 py-3 grid xl:grid-cols-4 gap-2 xl:gap-5 items-center">
            <b>{text('ICE contact name', 'ICE contact naam')}</b>
            <FormControl className="xl:col-span-3">
              <TextField
                size="small"
                value={form.iceContactName}
                fullWidth
                onChange={(e) => handleChange('iceContactName', e.target.value)}
                error={!!errors.iceContactName}
                helperText={errors.iceContactName && text(errors.iceContactName as Language)}
              />
            </FormControl>

            <b>{text('ICE email', 'ICE e-mailadres')}</b>
            <FormControl className="xl:col-span-3">
              <TextField
                size="small"
                value={form.iceContactEmail}
                fullWidth
                onChange={(e) => handleChange('iceContactEmail', e.target.value)}
                error={!!errors.iceContactEmail}
                helperText={errors.iceContactEmail && text(errors.iceContactEmail as Language)}
              />
            </FormControl>

            <b>{text('ICE phone number', 'ICE telefoonnummer')}</b>
            <FormControl className="xl:col-span-3">
              <TextField
                size="small"
                value={form.iceContactPhone}
                fullWidth
                onChange={(e) => handleChange('iceContactPhone', e.target.value)}
                error={!!errors.iceContactPhone}
                helperText={errors.iceContactPhone && text(errors.iceContactPhone as Language)}
              />
            </FormControl>
          </TextCard>

          <div className="flex justify-end mt-5">
            <Button variant="contained" color="primary" type="submit" onClick={validateInputs}>
              {text('Save changes', 'Wijzigingen opslaan')}
            </Button>
          </div>
        </Box>
      ) : (
        <TextCard className="px-3 xl:px-6 py-3 grid xl:grid-cols-4 gap-2 xl:gap-5 mb-3 items-center">
          <b>{text('First name', 'Voornaam')}</b>
          <span className="xl:col-span-3">{viewUser.firstName}</span>

          <b>{text('Infix', 'Tussenvoegsel')}</b>
          <span className="xl:col-span-3">{viewUser.infix}</span>

          <b>{text('Last name', 'Achternaam')}</b>
          <span className="xl:col-span-3">{viewUser.lastName}</span>
        </TextCard>
      )}
    </ContentCard>
  );
}
