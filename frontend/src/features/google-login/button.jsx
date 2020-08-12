import React, { useState, useEffect } from 'react'
import { UserManager } from 'oidc-client'

import { Log } from 'oidc-client'

if (process.env.NODE_ENV !== 'production') {
  Log.logger = console
  Log.level = Log.INFO
}

const config = {
  authority: 'https://accounts.google.com/',
  client_id: '576929321854-c33uueff0j60au8i87lecabbqme5s3hj.apps.googleusercontent.com',
  redirect_uri: window.location.protocol + "//" + window.location.host + '/.auth/google/login',
  scope: 'email profile openid',
  automaticSilentRenew: true,
}

const Button = () => {
  const [um] = useState(new UserManager(config))

  const [token, setToken] = useState(null)
  const [profile, setProfile] = useState('')
  const [picture, setPicture] = useState('')

  useEffect(() => {
    um.events.addUserLoaded((user) => {

      setToken(user.id_token)
      setProfile(user.profile.name + ' (' + user.profile.email + ')')
      setPicture(user.profile.picture ?? '')
    })

    um.events.addUserUnloaded(() => {
      setToken(null)
    })

    um.signinSilent().catch((reason) => {
      setToken(null)
    })
  }, [um])

  const login = () => {
    um.signinPopup().catch((reason) => {
      console.log('Failed to log in! ' + reason)
    })
  }

  const switchUser = () => {
    um.signinPopup({ prompt: 'select_account' }).catch((reason) => {
      console.log('Failed to switch user! ' + reason)
    })
  }

  return (
    <div>
      {!token ?
        <button onClick={login} >Login</button> :
        <>
          <button onClick={switchUser}>Switch user</button>
          {picture ? <img alt='avatar' src={picture} /> : ''}{profile}
        </>}


      {token ? <><h5>Your Access Token:</h5><textarea readOnly value={token} /> </> : null}

    </div>
  )
}

export const CallbackPage = () => {
  useEffect(() => {
    new UserManager().signinCallback(window.location.href)
  })

  return null
}

export default Button
