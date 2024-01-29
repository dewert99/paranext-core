import { Grid } from '@mui/material';
import { CommandHandler, MenuItemInfo } from './menu-item.component';
import SimpleMenu, { MenuProps } from './simple-menu.component';
import './grid-menu.component.css';

export type MenuColumnInfo = {
  /** The name of the menu (displayed as the column header). */
  name: string;
  /*
   * The menu items to include.
   */
  items: MenuItemInfo[];
};

type MenuColumnProps = MenuColumnInfo & MenuProps;

export type GridMenuInfo = {
  /** The columns to display on the dropdown menu. */
  columns: MenuColumnInfo[];
};

export type GridMenuProps = GridMenuInfo & {
  /** Optional unique identifier */
  id?: string;

  commandHandler: CommandHandler;

  /** Additional css classes to help with unique styling of the toolbar */
  className?: string;
};

function MenuColumn({ commandHandler, name, className, items, id }: MenuColumnProps) {
  return (
    <Grid id={id} item xs="auto" className={`papi-menu-column ${className ?? ''}`}>
      <h3 className={`papi-menu-column-header ${className ?? ''}`}>{name}</h3>
      <SimpleMenu commandHandler={commandHandler} items={items} />
    </Grid>
  );
}

export default function GridMenu({ commandHandler, className, columns, id }: GridMenuProps) {
  return (
    <Grid
      container
      spacing={0}
      className={`papi-multi-column-menu ${className ?? ''}`}
      columns={columns.length}
      id={id}
    >
      {columns.map((col, index) => (
        <MenuColumn
          // By design, menu items will never get reordered. So the index works as a key.
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          commandHandler={commandHandler}
          name={col.name}
          className={className}
          items={col.items}
        />
      ))}
    </Grid>
  );
}
