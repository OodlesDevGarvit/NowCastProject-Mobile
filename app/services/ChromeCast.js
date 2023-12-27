import GoogleCast, { useRemoteMediaClient, useDevices, useCastDevice } from 'react-native-google-cast'

export function castController(client,castUrl) {
  if (client) {
    client.loadMedia({
      mediaInfo: {
        contentUrl:castUrl
      },
    })
  }
}

export async function handleCast() {
  try {
    GoogleCast.showCastDialog();
  } catch (error) {
    console.log(error)
  }
}