import {userInfo} from 'os'
import ow from 'ow'
import type {BasePredicate} from 'ow'
import {redirect} from '@remix-run/data'
import type {KCDAction} from 'types'
import {rootStorage} from '../utils/session.server'
import {sendEmail} from './send-email'

const {username} = userInfo()

const isEmail = ow.string.is((e: string) => /^.+@.+\..+$/.test(e))

function owWithMessage(
  val: unknown,
  message: string,
  validator: BasePredicate<unknown>,
) {
  try {
    ow(val, validator)
  } catch (error: unknown) {
    throw new Error(message)
  }
}

const sendContactEmail: KCDAction = async ({request}) => {
  const url = new URL(request.url)
  const runId = Date.now().toString().slice(-5)
  const log = (...args: Array<unknown>) => console.log(runId, ...args)

  const session = await rootStorage.getSession(
    request.headers.get('Cookie') ?? undefined,
  )

  const acceptable =
    (url.hostname === 'localhost' && username === 'kentcdodds') ||
    url.hostname === 'kentcdodds.com' ||
    url.hostname === 'kentcdodds-remix.herokuapp.com'

  if (!acceptable) {
    session.flash('error', 'Unacceptable request')
    return redirect('/contact', {
      headers: {
        'Set-Cookie': await rootStorage.commitSession(session),
      },
    })
  }

  const requestText = await request.text()
  const reqFormBody = new URLSearchParams(requestText)
  // our validation logic below confirms these are all strings
  const name = reqFormBody.get('name')!
  const email = reqFormBody.get('email')!
  const subject = reqFormBody.get('subject')!
  const body = reqFormBody.get('body')!

  try {
    log('> Validating input', ' name: ', name, ' email:', email)
    owWithMessage(name, 'The name is required.', ow.string.minLength(1))
    owWithMessage(name, 'The name is too long.', ow.string.maxLength(60))
    owWithMessage(
      email,
      'The email is invalid. Please enter a valid email address.',
      isEmail,
    )
    owWithMessage(
      subject,
      'The subject is too short. Please be more specific.',
      ow.string.minLength(5),
    )
    owWithMessage(
      subject,
      'The subject is too long. Please shorten it.',
      ow.string.maxLength(120),
    )
    owWithMessage(
      body,
      'The email body is too short. Give me more details please.',
      ow.string.minLength(40),
    )
    owWithMessage(
      body,
      'The email body is too long. Be more succinct please.',
      ow.string.maxLength(1001),
    )
  } catch (error: unknown) {
    let errorMessage = 'Unknown error'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    log('> Validation failed', errorMessage)
    session.flash('error', errorMessage)
    return redirect('/contact', {
      headers: {
        'Set-Cookie': await rootStorage.commitSession(session),
      },
    })
  }

  const sender = `"${name}" <${email}>`

  try {
    await sendEmail({
      from: sender,
      to: `"Kent C. Dodds" <me@kentcdodds.com>`,
      subject,
      text: body,
    })
  } catch (error: unknown) {
    let errorMessage = 'Unknown error'
    if (error instanceof Error) {
      errorMessage = error.message
    }

    session.flash('error', errorMessage)
    return redirect('/contact', {
      headers: {
        'Set-Cookie': await rootStorage.commitSession(session),
      },
    })
  }

  session.unset('fields')
  session.flash('result', {name, email, subject})
  return redirect('/contact/success', {
    headers: {
      'Set-Cookie': await rootStorage.commitSession(session),
    },
  })
}

export {sendContactEmail}

/*
eslint
  max-statements: "off",
*/
