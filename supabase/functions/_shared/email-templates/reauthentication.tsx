/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="de" dir="ltr">
    <Head />
    <Preview>Dein Bestätigungscode für Frauenmoment</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={card}>
          <Text style={brand}>FRAUENMOMENT</Text>
          <Heading style={h1}>
            Dein<br />
            <em style={emphasis}>Bestätigungscode.</em>
          </Heading>
          <Text style={text}>
            Verwende den Code unten, um deine Identität zu bestätigen:
          </Text>
          <Text style={codeStyle}>{token}</Text>
          <div style={divider} />
          <Text style={footer}>
            Dieser Code läuft bald ab. Wenn du das nicht angefordert hast,
            kannst du diese Mail ignorieren.
          </Text>
          <Text style={footerSmall}>
            Dein Name bleibt anonym. Nur zur Sicherheit deines Kontos.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#ffffff', fontFamily: '"DM Sans", Helvetica, Arial, sans-serif', margin: 0, padding: '40px 20px' }
const container = { maxWidth: '520px', margin: '0 auto' }
const card = { backgroundColor: '#FAF6F2', padding: '56px 44px', borderTop: '3px solid #C4785A' }
const brand = { fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: '11px', letterSpacing: '0.32em', color: '#C4785A', margin: '0 0 40px', fontWeight: 400 }
const h1 = { fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: '40px', fontWeight: 300, color: '#241B16', lineHeight: 1.1, margin: '0 0 28px' }
const emphasis = { fontStyle: 'italic', color: '#C4785A', fontWeight: 300 }
const text = { fontFamily: '"DM Sans", Helvetica, Arial, sans-serif', fontSize: '15px', color: '#5C4F47', lineHeight: 1.7, margin: '0 0 24px', fontWeight: 300 }
const codeStyle = { fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: '36px', letterSpacing: '0.25em', color: '#C4785A', textAlign: 'center' as const, margin: '0 0 40px', fontWeight: 400 }
const divider = { height: '1px', background: 'linear-gradient(to right, transparent, #EFC9B6, transparent)', margin: '0 0 28px' }
const footer = { fontFamily: '"DM Sans", Helvetica, Arial, sans-serif', fontSize: '12px', color: '#9C8B82', lineHeight: 1.6, margin: '0 0 8px' }
const footerSmall = { fontFamily: '"DM Sans", Helvetica, Arial, sans-serif', fontSize: '11px', color: '#B5A89F', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }
