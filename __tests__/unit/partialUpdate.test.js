const { NODE_ENV_TEST } = require('./jest.config.js');
const sqlForPartialUpdate = require('../../helpers/partialUpdate');

describe('partialUpdate()', () => {
  it('should generate a proper partial update query with just 1 field', function () {
    const updateObj = sqlForPartialUpdate(
      'companies',
      {
        handle: 'SUN',
        name: 'Sunoco',
        num_employees: 1000,
        description:
          'Sunoco is a trusted American brand built on innovation and quality.',
        logo_url: 'https://tinyurl.com/yxm5c4bq',
      },
      'handle',
      1
    );
    const query = `UPDATE companies SET handle=$${1}, name=$${2}, num_employees=$${3}, description=$${4}, logo_url=$${5} WHERE handle=$${6} RETURNING *`;
    console.log(updateObj);
    const values = [
      'SUN',
      'Sunoco',
      1000,
      'Sunoco is a trusted American brand built on innovation and quality.',
      'https://tinyurl.com/yxm5c4bq',
      1,
    ];

    expect(updateObj).toEqual({ query, values });
  });
});
