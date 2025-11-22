import {useContext} from 'react';
import {useWebsite, WebsiteContext} from './useState.ts';
import {enqueueSnackbar} from 'notistack';
import {useLanguage} from '../providers/LanguageProvider.tsx';
import {apiFetch, apiFetchVoid} from '../api.ts';
import {User, UserContent} from '../types.ts';
import {useSelector} from './useSelector.ts';

export function useUsers() {
  const {dispatch, state} = useContext(WebsiteContext);
  const {text} = useLanguage();
  const {navigate} = useWebsite();

  const users = useSelector((state) => state.users || []);

  const user = state.user;
  const currentUser = state.currentUser;

  const logout = () => {
    fetch('/api/logout')
      .then((response) => {
        if (response.ok) {
          dispatch({type: 'logout'});
          enqueueSnackbar(text('logged out', 'uitgelogd'), {variant: 'success'});
          navigate('index');
        } else {
          enqueueSnackbar(text('error', 'error'), {variant: 'error'});
        }
      });
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const {data: user, error} = await apiFetch<User>('/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email, password}),
    });
    if (error) {
      switch (error.message) {
      case 'Unauthorized':
        enqueueSnackbar('Incorrect email or password.', {variant: 'error'});
        break;
      default:
        enqueueSnackbar(`${error.message}: ${error.reference}`, {variant: 'error'});
      }
      return false;
    } else {
      dispatch({type: 'login', user});
      enqueueSnackbar('You logged in', {variant: 'success'});
      return true;
    }
  };

  const signup = async (user: UserContent): Promise<boolean> => {
    const {data, error} = await apiFetch<User>('/register', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(user)
    });

    if (error) {
      switch (error.message) {
      case 'Conflict':
        enqueueSnackbar(text('Email is already in use.', 'E-mail is al in gebruik.'), {variant: 'error'});
        break;
      default:
        enqueueSnackbar(`${error.message}: ${error.reference}`, {variant: 'error'});
      }
      return false;
    } else {
      dispatch({type: 'login', user: data});
      enqueueSnackbar(`Created account: ${user.firstName} ${user.lastName}`, {variant: 'success'});
      return true;
    }
  };

  const updateUser = async (userId: string, user: Omit<UserContent, 'password'>): Promise<boolean> => {
    const {data, error} = await apiFetch<User>(`/user/${userId}`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(user)
    });

    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, {variant: 'error'});
      return false;
    } else {
      dispatch({type: 'delete_user', userId: userId});
      dispatch({type: 'add_user', user: data});
      if (state.currentUser && state.currentUser.id === userId){
        dispatch({type: 'set_current_user', user: data});
      }
      enqueueSnackbar(`Updated user: ${user.firstName} ${user.lastName}`, {variant: 'success'});
      return true;
    }
  }

  const updateUserPassword = async (userId: string, newPwd: string): Promise<boolean> => {
    const {error} = await apiFetchVoid(`/user/${userId}/password`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({password: newPwd})
    });

    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, {variant: 'error'});
      return false;
    } else {
      enqueueSnackbar('Updated password', {variant: 'success'});
      return true;
    }
  }

  return {user, users, currentUser, logout, login, signup, updateUser, updateUserPassword};
}