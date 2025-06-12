import * as yup from 'yup';

const createFeedSchema = (existingFeeds) => {
  return yup.object({
    url: yup
      .string()
      .required('URL is required')
      .url('Must be a valid URL')
      .test('unique', 'RSS feed already exists', value => 
        !existingFeeds.includes(value)
      )
  });
};

export const validateFeed = async (url, existingFeeds) => {
  const schema = createFeedSchema(existingFeeds);
  try {
    await schema.validate({ url }, { abortEarly: false });
    return { isValid: true, errors: [] };
  } catch (err) {
    return { 
      isValid: false, 
      errors: err.inner.map(e => ({ path: e.path, message: e.message }))
    };
  }
};