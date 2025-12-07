import slugifyLib from 'slugify';

export function generateSlug(title: string): string {
  return slugifyLib(title, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
  });
}

