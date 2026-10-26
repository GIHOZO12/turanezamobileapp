import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Linking, Platform } from 'react-native';

import { API_BASE_URL, resolveMediaUrl } from '@/api/client';
import { getCachedAccessToken } from '@/api/token-store';

const MIME_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  dwg: 'application/acad',
  zip: 'application/zip',
};

function extensionOf(url: string) {
  const path = url.split(/[?#]/)[0];
  const match = /\.([a-z0-9]{1,5})$/i.exec(path);
  return match ? match[1].toLowerCase() : '';
}

/**
 * Downloads a backend file into the app cache, then opens the system share sheet — on iOS and
 * Android that's how a user saves a file to Files / Downloads / Drive, since apps can't write
 * to shared storage directly. The bearer token is only attached for our own API host so it
 * never leaks to an external storage provider (e.g. a pre-signed S3 URL).
 */
export async function downloadAndShareFile(path: string, title: string) {
  const url = resolveMediaUrl(path);
  if (!url) throw new Error('This document has no file attached.');

  if (Platform.OS === 'web') {
    await Linking.openURL(url);
    return;
  }

  const extension = extensionOf(url);
  const safeTitle = title.replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-') || 'document';
  const destination = new File(Paths.cache, extension ? `${safeTitle}.${extension}` : safeTitle);
  if (destination.exists) destination.delete();

  const accessToken = getCachedAccessToken();
  const headers: Record<string, string> = accessToken && url.startsWith(API_BASE_URL) ? { Authorization: `Bearer ${accessToken}` } : {};

  const file = await File.createDownloadTask(url, destination, { headers }).downloadAsync();
  if (!file) throw new Error('The download did not finish.');

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Saving files is not available on this device.');
  }
  await Sharing.shareAsync(file.uri, {
    mimeType: MIME_TYPES[extension],
    UTI: extension ? `.${extension}` : undefined,
    dialogTitle: `Save ${title}`,
  });
}
