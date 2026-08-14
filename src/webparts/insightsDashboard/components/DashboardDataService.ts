import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { IListItemRecord } from './IInsightsDashboardProps';

const PAGE_SIZE = 500;

/**
 * Pulls every item from a SharePoint list, following @odata.nextLink
 * so lists with hundreds/thousands of rows still load in full.
 */
export async function fetchAllListItems(
  spHttpClient: SPHttpClient,
  siteUrl: string,
  listName: string,
  fields: string[]
): Promise<IListItemRecord[]> {
  const select = ['Id', ...fields].join(',');
  const encodedList = encodeURIComponent(listName.replace(/'/g, "''"));

  let url =
    `${siteUrl}/_api/web/lists/getbytitle('${encodedList}')/items` +
    `?$select=${select}&$top=${PAGE_SIZE}`;

  const items: IListItemRecord[] = [];

  while (url) {
    const response: SPHttpClientResponse = await spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`SharePoint REST call failed (${response.status}): ${body}`);
    }

    const json = await response.json();
    items.push(...(json.value as IListItemRecord[]));
    url = json['odata.nextLink'] || json['@odata.nextLink'] || '';
  }

  return items;
}
