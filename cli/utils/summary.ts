import { getBorderCharacters } from 'table';
import { Person } from '../../src/types.d/index.js';
import { table } from 'table';

export const summaryOf = (data: Person[]): void => {
  const headers = [['Name', 'Headline']];

  console.log(
    table(
      [
        ...headers,
        ...data.map((person: Person) => [person.name, person.headline]),
      ],
      {
        singleLine: true,
        border: getBorderCharacters(`ramac`),
      }
    )
  );
};
