/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({ confirmationUrl }: InviteEmailProps) => (
  <Html lang="de" dir="ltr">
    <Head />
    <Preview>Du wurdest zu Frauenmoment eingeladen</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={card}>
          <Text style={brand}>FRAUENMOMENT</Text>
          <Heading style={h1}>
            Du bist<br />
            <em style={emphasis}>eingeladen.</em>
          </Heading>
          <Text style={text}>
            Du wurdest eingeladen, Frauenmoment beizutreten — einem anonymen
            Ort für ungesendete Briefe und unausgesprochene Gedanken.
            Klicke unten, um dein Konto zu erstellen.
          </Text>
          <Section style={buttonWrap}>
            <Button style={button} href={confirmationUrl}>
              Einladung annehmen
            </Button>
          </Section>
          <div style={divider} />
          <Text style={footer}>
            Wenn du diese Einladung nicht erwartet hast, kannst du diese Mail ignorieren.
          </Text>
          <Text style={footerSmall}>
            Dein Name bleibt anonym. Nur zur Sicherheit deines Kontos.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail

const main = { backgroundColor: '#ffffff', fontFamily: '"DM Sans", Helvetica, Arial, sans-serif', margin: 0, padding: '40px 20px' }
const container = { maxWidth: '520px', margin: '0 auto' }
const card = { backgroundColor: '#FAF6F2', padding: '56px 44px', borderTop: '3px solid #C4785A' }
const brand = { fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: '11px', letterSpacing: '0.32em', color: '#C4785A', margin: '0 0 40px', fontWeight: 400 }
const h1 = { fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: '40px', fontWeight: 300, color: '#241B16', lineHeight: 1.1, margin: '0 0 28px' }
const emphasis = { fontStyle: 'italic', color: '#C4785A', fontWeight: 300 }
const text = { fontFamily: '"DM Sans", Helvetica, Arial, sans-serif', fontSize: '15px', color: '#5C4F47', lineHeight: 1.7, margin: '0 0 36px', fontWeight: 300 }
const buttonWrap = { textAlign: 'center' as const, margin: '0 0 40px' }
const button = { backgroundColor: '#241B16', color: '#FAF6F2', fontSize: '12px', letterSpacing: '0.18em', textTransform: 'uppercase' as const, padding: '16px 36px', textDecoration: 'none', fontFamily: '"DM Sans", Helvetica, Arial, sans-serif', fontWeight: 400, display: 'inline-block' }
const divider = { height: '1px', background: 'linear-gradient(to right, transparent, #EFC9B6, transparent)', margin: '0 0 28px' }
const footer = { fontFamily: '"DM Sans", Helvetica, Arial, sans-serif', fontSize: '12px', color: '#9C8B82', lineHeight: 1.6, margin: '0 0 8px' }
const footerSmall = { fontFamily: '"DM Sans", Helvetica, Arial, sans-serif', fontSize: '11px', color: '#B5A89F', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }
