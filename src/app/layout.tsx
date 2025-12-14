import type { Metadata } from 'next'
import {
  Libre_Baskerville,
  Crimson_Pro,
  Fraunces,
  Manrope,
  Spectral,
  Source_Sans_3,
  EB_Garamond,
  Karla,
  Outfit,
  DM_Sans,
  Abhaya_Libre,
  Nunito_Sans,
  Bebas_Neue,
  Barlow,
  Merriweather,
  IBM_Plex_Sans,
} from 'next/font/google'
import './globals.css'

export const metadata: Metadata = {
  title: 'Aurora OS',
  description: 'A visual, ADHD-friendly file management layer for macOS',
}

const libreBaskerville = Libre_Baskerville({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-libre-baskerville' })
const crimsonPro = Crimson_Pro({ subsets: ['latin'], weight: ['300', '400', '600'], variable: '--font-crimson-pro' })
const fraunces = Fraunces({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-fraunces' })
const manrope = Manrope({ subsets: ['latin'], weight: ['300', '400', '600'], variable: '--font-manrope' })
const spectral = Spectral({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-spectral' })
const sourceSans3 = Source_Sans_3({ subsets: ['latin'], weight: ['300', '400', '600'], variable: '--font-source-sans-3' })
const ebGaramond = EB_Garamond({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-eb-garamond' })
const karla = Karla({ subsets: ['latin'], weight: ['300', '400', '600'], variable: '--font-karla' })
const outfit = Outfit({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-outfit' })
const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-dm-sans' })
const abhayaLibre = Abhaya_Libre({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-abhaya-libre' })
const nunitoSans = Nunito_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  variable: '--font-nunito-sans',
  adjustFontFallback: false,
})
const bebasNeue = Bebas_Neue({ subsets: ['latin'], weight: ['400'], variable: '--font-bebas-neue' })
const barlow = Barlow({ subsets: ['latin'], weight: ['300', '400', '600'], variable: '--font-barlow' })
const merriweather = Merriweather({ subsets: ['latin'], weight: ['400', '700', '900'], variable: '--font-merriweather' })
const ibmPlexSans = IBM_Plex_Sans({ subsets: ['latin'], weight: ['300', '400', '600'], variable: '--font-ibm-plex-sans' })

const fontVars = [
  libreBaskerville.variable,
  crimsonPro.variable,
  fraunces.variable,
  manrope.variable,
  spectral.variable,
  sourceSans3.variable,
  ebGaramond.variable,
  karla.variable,
  outfit.variable,
  dmSans.variable,
  abhayaLibre.variable,
  nunitoSans.variable,
  bebasNeue.variable,
  barlow.variable,
  merriweather.variable,
  ibmPlexSans.variable,
].join(' ')

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`text-[14px] ${fontVars}`}>
      <body className="font-sans antialiased bg-macos-gray-50 text-macos-gray-900">
        {children}
      </body>
    </html>
  )
}
