import {useEffect} from 'react';
import {Button, Box, FormControl} from '@mui/material';
import {UserContent} from '../../types';
import {useLanguage} from '../../providers/LanguageProvider';
import ContentCard from '../ContentCard.tsx';
import TextCard from '../TextCard.tsx';
import {getLabel, isAdminOrBoard} from '../../util.ts';
import UserActions from './UserActions.tsx';
import {useWebsite} from '../../hooks/useState.ts';
import {useUsers} from '../../hooks/useUsers.ts';
import {SubmitHandler, useForm} from 'react-hook-form';
import {FormInputText} from '../form/FormInputText.tsx';

type FormInputs = Omit<UserContent, 'status' | 'roles'>;

export default function UserDetails() {
  const {text} = useLanguage();
  const {user, currentUser, updateUser} = useUsers();
  const {state: {routerState: {params}}} = useWebsite();
  const {register, handleSubmit, control, reset, formState} = useForm<FormInputs>({
    defaultValues: currentUser!,
  });

  useEffect(() => {
    reset(currentUser!);
  }, [currentUser, reset]);

  if (!user || !currentUser) {
    return null;
  }

  const isMe = params.user_id === user.id;
  const canEdit = isAdminOrBoard(user.roles) || isMe;


  const handleSave: SubmitHandler<FormInputs> = async (user) => {
    await updateUser(currentUser.id, {...currentUser, ...user});
  };

  return (
    <ContentCard className="grid gap-1">
      <div className="flex justify-between w-full">
        <h1>{isMe ? text('My account', 'Mijn account') : `${currentUser.firstName.charAt(0).toUpperCase() + currentUser.firstName.slice(1)}'s account`}</h1>
        <UserActions/>
      </div>

      {canEdit ? (
        <Box component="form" onSubmit={handleSubmit(handleSave)} key={currentUser.id}>
          {/* Personal information */}
          <h2>{text('Personal information', 'Persoonlijke informatie')}</h2>
          <TextCard className="px-3 xl:px-6 py-3 grid xl:grid-cols-4 gap-2 xl:gap-5 mb-3 items-center">
            <b>{text('First name', 'Voornaam')}</b>
            <FormControl className="xl:col-span-3">
              <FormInputText
                {...register('firstName', {
                  required: text('Name must be at least 2 characters long', 'Naam moet ten minste 2 karakters lang zijn'),
                  minLength: {
                    value: 2,
                    message: text('Name must be at least 2 characters long', 'Naam moet ten minste 2 karakters lang zijn')
                  }
                })}
                control={control}
                disabled={!isAdminOrBoard(user.roles)}
              />
            </FormControl>

            <b>{text('Infix', 'Tussenvoegsel')}</b>
            <FormControl className="xl:col-span-3">
              <FormInputText
                {...register('infix', {
                  pattern: {
                    value: /^[a-zA-Z\s'-]*$/,
                    message: text(
                      'Only letters, spaces, apostrophes, and hyphens are allowed',
                      'Alleen letters, spaties, apostroffen en koppeltekens zijn toegestaan'
                    )
                  }
                })}
                control={control}
                disabled={!isAdminOrBoard(user.roles)}
              />
            </FormControl>

            <b>{text('Last name', 'Achternaam')}</b>
            <FormControl className="xl:col-span-3">
              <FormInputText
                {...register('lastName', {
                  required: text('Name must be at least 2 characters long', 'Naam moet ten minste 2 karakters lang zijn'),
                  minLength: {
                    value: 2,
                    message: text('Name must be at least 2 characters long', 'Naam moet ten minste 2 karakters lang zijn')
                  }
                })}
                control={control}
                disabled={!isAdminOrBoard(user.roles)}
              />
            </FormControl>

            <b>{text('Phone number', 'Telefoonnummer')}</b>
            <FormControl className="xl:col-span-3">
              <FormInputText
                {...register('phone', {
                  required: text('Invalid phone number', 'Ongeldig telefoonnummer'),
                  pattern: {
                    value: /^\+?[0-9\s-]{7,15}$/,
                    message: text('Invalid phone number', 'Ongeldig telefoonnummer')
                  }
                })}
                control={control}
              />
            </FormControl>

            <b>{text('Email', 'E-mailadres')}</b>
            <FormControl className="xl:col-span-3">
              <FormInputText
                {...register('email', {
                  required: text('Invalid email address', 'Ongeldig e-mailadres'),
                  pattern: {
                    value: /^[\w.!#$%&'*+/=?^`{|}~-]+@[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?(?:\.[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?)*$/i,
                    message: text('Invalid email address', 'Ongeldig e-mailadres')
                  }
                })}
                control={control}
              />
            </FormControl>

            <b>{text('Important information', 'Belangrijke informatie')}</b>
            <FormControl className="xl:col-span-3">
              <FormInputText
                {...register('importantInfo', {
                  maxLength: {
                    value: 2000,
                    message: text('At most 2000 characters', 'Maximaal 2000 karakters')
                  }
                })}
                control={control}
              />
            </FormControl>

            <b>{text('Membership status', 'Lidmaatschapsstatus')}</b>
            <span className="xl:col-span-3">{text(getLabel(currentUser.status))}</span>

            <b>{text('Roles', 'Rollen')}</b>
            <span className="xl:col-span-3">
              {currentUser.roles && currentUser.roles.map((r) => text(getLabel(r))).join(', ')}
            </span>
          </TextCard>

          {/* Education & Insurance */}
          <h2>{text('Education & Insurance', 'Educatie & Verzekering')}</h2>
          <TextCard className="px-3 xl:px-6 py-3 grid xl:grid-cols-4 gap-2 xl:gap-5 mb-3 items-center">
            <b>{text('Student number', 'Studentnummer')}</b>
            <FormControl className="xl:col-span-3">
              <FormInputText
                {...register('studentNumber', {
                  minLength: {
                    value: 5,
                    message: text('At least 5 characters', 'Minimaal 5 karakters')
                  },
                  maxLength: {
                    value: 20,
                    message: text('At most 20 characters', 'Maximaal 20 karakters')
                  }
                })}
                control={control}
              />
            </FormControl>

            <b>{text('Sportscard number', 'Sportkaartnummer')}</b>
            <FormControl className="xl:col-span-3">
              <FormInputText
                {...register('sportcardNumber', {
                  minLength: {
                    value: 5,
                    message: text('At least 5 characters', 'Minimaal 5 karakters')
                  },
                  maxLength: {
                    value: 20,
                    message: text('At most 20 characters', 'Maximaal 20 karakters')
                  }
                })}
                control={control}
              />
            </FormControl>

            <b>{text('NKBV number', 'NKBV-nummer')}</b>
            <FormControl className="xl:col-span-3">
              <FormInputText
                {...register('nkbvNumber', {
                  minLength: {
                    value: 5,
                    message: text('At least 5 characters', 'Minimaal 5 karakters')
                  },
                  maxLength: {
                    value: 20,
                    message: text('At most 20 characters', 'Maximaal 20 karakters')
                  }
                })}
                control={control}
              />
            </FormControl>
          </TextCard>

          {/* Emergency contact */}
          <h2>{text('Emergency contact', 'Contact noodgevallen')}</h2>
          <TextCard className="px-3 xl:px-6 py-3 grid xl:grid-cols-4 gap-2 xl:gap-5 items-center">
            <b>{text('ICE contact name', 'ICE contact naam')}</b>
            <FormControl className="xl:col-span-3">
              <FormInputText
                {...register('iceContactName', {
                  minLength: {
                    value: 5,
                    message: text('At least 2 characters', 'Minimaal 2 karakters')
                  },
                  maxLength: {
                    value: 20,
                    message: text('At most 30 characters', 'Maximaal 30 karakters')
                  }
                })}
                control={control}
              />
            </FormControl>

            <b>{text('ICE email', 'ICE e-mailadres')}</b>
            <FormControl className="xl:col-span-3">
              <FormInputText
                {...register('iceContactEmail', {
                  pattern: {
                    value: /^[\w.!#$%&'*+/=?^`{|}~-]+@[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?(?:\.[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?)*$/i,
                    message: text('Invalid email address', 'Ongeldig e-mailadres')
                  }
                })}
                control={control}
              />
            </FormControl>

            <b>{text('ICE phone number', 'ICE telefoonnummer')}</b>
            <FormControl className="xl:col-span-3">
              <FormInputText
                {...register('iceContactPhone', {
                  pattern: {
                    value: /^\+?[0-9\s-]{7,15}$/,
                    message: text('Invalid phone number', 'Ongeldig telefoonnummer')
                  }
                })}
                control={control}
              />
            </FormControl>
          </TextCard>

          <div className="flex justify-end mt-5">
            <Button variant="contained" color="primary" type="submit" loading={formState.isSubmitting}>
              {text('Save changes', 'Wijzigingen opslaan')}
            </Button>
          </div>
        </Box>
      ) : (
        <TextCard className="px-3 xl:px-6 py-3 grid xl:grid-cols-4 gap-2 xl:gap-5 mb-3 items-center">
          <b>{text('First name', 'Voornaam')}</b>
          <span className="xl:col-span-3">{currentUser.firstName}</span>

          <b>{text('Infix', 'Tussenvoegsel')}</b>
          <span className="xl:col-span-3">{currentUser.infix}</span>

          <b>{text('Last name', 'Achternaam')}</b>
          <span className="xl:col-span-3">{currentUser.lastName}</span>
        </TextCard>
      )}
    </ContentCard>
  );
}
