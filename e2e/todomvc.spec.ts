import { expect, test } from "@playwright/test";

const TODO_ITEMS = ["buy some cheese", "feed the cat", "book a doctor's appointment"];

test.describe("TodoMVC Application", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
    });

    test.describe("New Todo", () => {
        test("should allow me to add todo items", async ({ page }) => {
            const newTodo = page.getByPlaceholder("What needs to be done?");

            // Create first todo
            await newTodo.fill(TODO_ITEMS[0]);
            await newTodo.press("Enter");

            // Verify the todo is added
            await expect(page.getByTestId("todo-title")).toHaveText([TODO_ITEMS[0]]);

            // Take screenshot after first todo
            await page.screenshot({
                path: "test-results/screenshots/01-first-todo-added.png",
                fullPage: true,
            });

            // Create second todo
            await newTodo.fill(TODO_ITEMS[1]);
            await newTodo.press("Enter");

            // Verify both todos are in the list
            await expect(page.getByTestId("todo-title")).toHaveText([TODO_ITEMS[0], TODO_ITEMS[1]]);

            // Take screenshot after second todo
            await page.screenshot({
                path: "test-results/screenshots/02-two-todos-added.png",
                fullPage: true,
            });
        });

        test("should clear text input field when an item is added", async ({ page }) => {
            const newTodo = page.getByPlaceholder("What needs to be done?");

            await newTodo.fill(TODO_ITEMS[0]);
            await newTodo.press("Enter");

            await expect(newTodo).toBeEmpty();

            await page.screenshot({
                path: "test-results/screenshots/03-input-cleared-after-add.png",
                fullPage: true,
            });
        });

        test("should append new items to the bottom of the list", async ({ page }) => {
            const newTodo = page.getByPlaceholder("What needs to be done?");

            // Add all three items
            for (const item of TODO_ITEMS) {
                await newTodo.fill(item);
                await newTodo.press("Enter");
            }

            // Verify the todo count
            await expect(page.getByTestId("todo-count")).toHaveText("3 items left");

            // Verify all items are in order
            await expect(page.getByTestId("todo-title")).toHaveText(TODO_ITEMS);

            await page.screenshot({
                path: "test-results/screenshots/04-three-todos-in-order.png",
                fullPage: true,
            });
        });
    });

    test.describe("Mark all as completed", () => {
        test.beforeEach(async ({ page }) => {
            const newTodo = page.getByPlaceholder("What needs to be done?");
            for (const item of TODO_ITEMS) {
                await newTodo.fill(item);
                await newTodo.press("Enter");
            }
        });

        test("should allow me to mark all items as completed", async ({ page }) => {
            // Mark all as complete
            await page.getByLabel("Mark all as complete").check();

            // Verify all checkboxes are checked
            await expect(page.getByTestId("todo-item")).toHaveClass([/completed/, /completed/, /completed/]);

            await page.screenshot({
                path: "test-results/screenshots/05-all-marked-completed.png",
                fullPage: true,
            });
        });

        test("should allow me to clear the complete state of all items", async ({ page }) => {
            // Mark all as complete then uncheck
            const toggleAll = page.getByLabel("Mark all as complete");
            await toggleAll.check();
            await toggleAll.uncheck();

            // Verify checkboxes are unchecked
            await expect(page.getByTestId("todo-item")).not.toHaveClass([/completed/, /completed/, /completed/]);

            await page.screenshot({
                path: "test-results/screenshots/06-all-unmarked.png",
                fullPage: true,
            });
        });
    });

    test.describe("Item", () => {
        test("should allow me to mark items as complete", async ({ page }) => {
            const newTodo = page.getByPlaceholder("What needs to be done?");

            // Add two items
            await newTodo.fill(TODO_ITEMS[0]);
            await newTodo.press("Enter");

            await newTodo.fill(TODO_ITEMS[1]);
            await newTodo.press("Enter");

            // Mark the first item as complete
            const firstTodo = page.getByTestId("todo-item").nth(0);
            await firstTodo.getByRole("checkbox").check();
            await expect(firstTodo).toHaveClass(/completed/);

            // Second item should remain uncompleted
            const secondTodo = page.getByTestId("todo-item").nth(1);
            await expect(secondTodo).not.toHaveClass(/completed/);

            await page.screenshot({
                path: "test-results/screenshots/07-first-item-completed.png",
                fullPage: true,
            });

            // Mark second item as complete
            await secondTodo.getByRole("checkbox").check();
            await expect(secondTodo).toHaveClass(/completed/);

            await page.screenshot({
                path: "test-results/screenshots/08-both-items-completed.png",
                fullPage: true,
            });
        });

        test("should allow me to un-mark items as complete", async ({ page }) => {
            const newTodo = page.getByPlaceholder("What needs to be done?");

            await newTodo.fill(TODO_ITEMS[0]);
            await newTodo.press("Enter");

            await newTodo.fill(TODO_ITEMS[1]);
            await newTodo.press("Enter");

            const firstTodo = page.getByTestId("todo-item").nth(0);
            await firstTodo.getByRole("checkbox").check();
            await expect(firstTodo).toHaveClass(/completed/);

            // Uncheck the first item
            await firstTodo.getByRole("checkbox").uncheck();
            await expect(firstTodo).not.toHaveClass(/completed/);

            await page.screenshot({
                path: "test-results/screenshots/09-item-uncompleted.png",
                fullPage: true,
            });
        });

        test("should allow me to edit an item", async ({ page }) => {
            const newTodo = page.getByPlaceholder("What needs to be done?");

            for (const item of TODO_ITEMS) {
                await newTodo.fill(item);
                await newTodo.press("Enter");
            }

            const todoItems = page.getByTestId("todo-item");
            const secondTodo = todoItems.nth(1);

            // Double-click to edit
            await secondTodo.dblclick();
            await expect(secondTodo.getByRole("textbox", { name: "Edit" })).toHaveValue(TODO_ITEMS[1]);

            await page.screenshot({
                path: "test-results/screenshots/10-editing-item.png",
                fullPage: true,
            });

            // Update the item
            await secondTodo.getByRole("textbox", { name: "Edit" }).fill("buy some sausages");
            await secondTodo.getByRole("textbox", { name: "Edit" }).press("Enter");

            // Verify the update
            await expect(todoItems).toHaveText([TODO_ITEMS[0], "buy some sausages", TODO_ITEMS[2]]);

            await page.screenshot({
                path: "test-results/screenshots/11-item-edited.png",
                fullPage: true,
            });
        });
    });

    test.describe("Editing", () => {
        test.beforeEach(async ({ page }) => {
            const newTodo = page.getByPlaceholder("What needs to be done?");
            for (const item of TODO_ITEMS) {
                await newTodo.fill(item);
                await newTodo.press("Enter");
            }
        });

        test("should save edits on blur", async ({ page }) => {
            const todoItems = page.getByTestId("todo-item");
            await todoItems.nth(1).dblclick();

            await todoItems.nth(1).getByRole("textbox", { name: "Edit" }).fill("buy some sausages");
            await todoItems.nth(1).getByRole("textbox", { name: "Edit" }).blur();

            await expect(todoItems).toHaveText([TODO_ITEMS[0], "buy some sausages", TODO_ITEMS[2]]);

            await page.screenshot({
                path: "test-results/screenshots/12-edit-saved-on-blur.png",
                fullPage: true,
            });
        });

        test("should trim entered text", async ({ page }) => {
            const todoItems = page.getByTestId("todo-item");
            await todoItems.nth(1).dblclick();

            await todoItems.nth(1).getByRole("textbox", { name: "Edit" }).fill("    buy some sausages    ");
            await todoItems.nth(1).getByRole("textbox", { name: "Edit" }).press("Enter");

            await expect(todoItems).toHaveText([TODO_ITEMS[0], "buy some sausages", TODO_ITEMS[2]]);

            await page.screenshot({
                path: "test-results/screenshots/13-trimmed-text.png",
                fullPage: true,
            });
        });

        test("should remove the item if an empty text string was entered", async ({ page }) => {
            const todoItems = page.getByTestId("todo-item");
            await todoItems.nth(1).dblclick();

            await todoItems.nth(1).getByRole("textbox", { name: "Edit" }).fill("");
            await todoItems.nth(1).getByRole("textbox", { name: "Edit" }).press("Enter");

            await expect(todoItems).toHaveText([TODO_ITEMS[0], TODO_ITEMS[2]]);

            await page.screenshot({
                path: "test-results/screenshots/14-item-removed-empty-text.png",
                fullPage: true,
            });
        });

        test("should cancel edits on escape", async ({ page }) => {
            const todoItems = page.getByTestId("todo-item");
            await todoItems.nth(1).dblclick();

            await todoItems.nth(1).getByRole("textbox", { name: "Edit" }).fill("buy some sausages");
            await todoItems.nth(1).getByRole("textbox", { name: "Edit" }).press("Escape");

            await expect(todoItems).toHaveText(TODO_ITEMS);

            await page.screenshot({
                path: "test-results/screenshots/15-edit-cancelled.png",
                fullPage: true,
            });
        });
    });

    test.describe("Counter", () => {
        test("should display the current number of todo items", async ({ page }) => {
            const newTodo = page.getByPlaceholder("What needs to be done?");

            await newTodo.fill(TODO_ITEMS[0]);
            await newTodo.press("Enter");
            await expect(page.getByTestId("todo-count")).toContainText("1");

            await page.screenshot({
                path: "test-results/screenshots/16-counter-one-item.png",
                fullPage: true,
            });

            await newTodo.fill(TODO_ITEMS[1]);
            await newTodo.press("Enter");
            await expect(page.getByTestId("todo-count")).toContainText("2");

            await page.screenshot({
                path: "test-results/screenshots/17-counter-two-items.png",
                fullPage: true,
            });
        });
    });

    test.describe("Clear completed button", () => {
        test.beforeEach(async ({ page }) => {
            const newTodo = page.getByPlaceholder("What needs to be done?");
            for (const item of TODO_ITEMS) {
                await newTodo.fill(item);
                await newTodo.press("Enter");
            }
        });

        test("should display the correct text", async ({ page }) => {
            await page.getByTestId("todo-item").nth(0).getByRole("checkbox").check();
            await expect(page.getByRole("button", { name: "Clear completed" })).toBeVisible();

            await page.screenshot({
                path: "test-results/screenshots/18-clear-completed-button-visible.png",
                fullPage: true,
            });
        });

        test("should remove completed items when clicked", async ({ page }) => {
            const todoItems = page.getByTestId("todo-item");
            await todoItems.nth(1).getByRole("checkbox").check();
            await page.getByRole("button", { name: "Clear completed" }).click();

            await expect(todoItems).toHaveCount(2);
            await expect(todoItems).toHaveText([TODO_ITEMS[0], TODO_ITEMS[2]]);

            await page.screenshot({
                path: "test-results/screenshots/19-completed-cleared.png",
                fullPage: true,
            });
        });

        test("should be hidden when there are no items that are completed", async ({ page }) => {
            await page.getByTestId("todo-item").nth(0).getByRole("checkbox").check();
            await page.getByRole("button", { name: "Clear completed" }).click();

            await expect(page.getByRole("button", { name: "Clear completed" })).toBeHidden();

            await page.screenshot({
                path: "test-results/screenshots/20-clear-button-hidden.png",
                fullPage: true,
            });
        });
    });

    test.describe("Persistence", () => {
        test("should persist its data", async ({ page }) => {
            const newTodo = page.getByPlaceholder("What needs to be done?");

            for (const item of TODO_ITEMS.slice(0, 2)) {
                await newTodo.fill(item);
                await newTodo.press("Enter");
            }

            const todoItems = page.getByTestId("todo-item");
            await todoItems.nth(0).getByRole("checkbox").check();

            await expect(todoItems).toHaveText([TODO_ITEMS[0], TODO_ITEMS[1]]);
            await expect(todoItems.nth(0)).toHaveClass(/completed/);
            await expect(todoItems.nth(1)).not.toHaveClass(/completed/);

            await page.screenshot({
                path: "test-results/screenshots/21-before-reload.png",
                fullPage: true,
            });

            // Reload page
            await page.reload();

            // Verify data persists
            await expect(todoItems).toHaveText([TODO_ITEMS[0], TODO_ITEMS[1]]);
            await expect(todoItems.nth(0)).toHaveClass(/completed/);
            await expect(todoItems.nth(1)).not.toHaveClass(/completed/);

            await page.screenshot({
                path: "test-results/screenshots/22-after-reload-persisted.png",
                fullPage: true,
            });
        });
    });

    test.describe("Routing", () => {
        test.beforeEach(async ({ page }) => {
            const newTodo = page.getByPlaceholder("What needs to be done?");
            for (const item of TODO_ITEMS) {
                await newTodo.fill(item);
                await newTodo.press("Enter");
            }
        });

        test("should allow me to display active items", async ({ page }) => {
            const todoItem = page.getByTestId("todo-item");
            await todoItem.nth(1).getByRole("checkbox").check();

            await page.getByRole("link", { name: "Active" }).click();

            await expect(todoItem).toHaveCount(2);
            await expect(todoItem).toHaveText([TODO_ITEMS[0], TODO_ITEMS[2]]);

            await page.screenshot({
                path: "test-results/screenshots/23-active-filter.png",
                fullPage: true,
            });
        });

        test("should allow me to display completed items", async ({ page }) => {
            const todoItem = page.getByTestId("todo-item");
            await todoItem.nth(1).getByRole("checkbox").check();

            await page.getByRole("link", { name: "Completed" }).click();

            await expect(todoItem).toHaveCount(1);
            await expect(todoItem).toHaveText([TODO_ITEMS[1]]);

            await page.screenshot({
                path: "test-results/screenshots/24-completed-filter.png",
                fullPage: true,
            });
        });

        test("should allow me to display all items", async ({ page }) => {
            const todoItem = page.getByTestId("todo-item");
            await todoItem.nth(1).getByRole("checkbox").check();

            await page.getByRole("link", { name: "Active" }).click();
            await page.getByRole("link", { name: "Completed" }).click();
            await page.getByRole("link", { name: "All" }).click();

            await expect(todoItem).toHaveCount(3);

            await page.screenshot({
                path: "test-results/screenshots/25-all-filter.png",
                fullPage: true,
            });
        });

        test("should highlight the currently applied filter", async ({ page }) => {
            await expect(page.getByRole("link", { name: "All" })).toHaveClass("selected");

            await page.getByRole("link", { name: "Active" }).click();
            await expect(page.getByRole("link", { name: "Active" })).toHaveClass("selected");

            await page.screenshot({
                path: "test-results/screenshots/26-active-filter-highlighted.png",
                fullPage: true,
            });

            await page.getByRole("link", { name: "Completed" }).click();
            await expect(page.getByRole("link", { name: "Completed" })).toHaveClass("selected");

            await page.screenshot({
                path: "test-results/screenshots/27-completed-filter-highlighted.png",
                fullPage: true,
            });
        });
    });

    test.describe("Delete Item", () => {
        test("should allow me to delete a todo item", async ({ page }) => {
            const newTodo = page.getByPlaceholder("What needs to be done?");

            for (const item of TODO_ITEMS) {
                await newTodo.fill(item);
                await newTodo.press("Enter");
            }

            const todoItems = page.getByTestId("todo-item");

            // Hover over the second item to show the delete button
            await todoItems.nth(1).hover();
            await page.screenshot({
                path: "test-results/screenshots/28-hover-to-show-delete.png",
                fullPage: true,
            });

            // Click the destroy button
            await todoItems.nth(1).getByRole("button", { name: "Delete" }).click();

            await expect(todoItems).toHaveCount(2);
            await expect(todoItems).toHaveText([TODO_ITEMS[0], TODO_ITEMS[2]]);

            await page.screenshot({
                path: "test-results/screenshots/29-item-deleted.png",
                fullPage: true,
            });
        });
    });

    test.describe("Failing Scenarios (Intentional)", () => {
        test("should fail - verify non-existent element exists", async ({ page }) => {
            // This test intentionally fails to demonstrate failure screenshots
            const newTodo = page.getByPlaceholder("What needs to be done?");

            await newTodo.fill(TODO_ITEMS[0]);
            await newTodo.press("Enter");

            await page.screenshot({
                path: "test-results/screenshots/30-before-failing-check.png",
                fullPage: true,
            });

            // This will fail - looking for text that doesn't exist
            await expect(page.getByTestId("todo-title")).toHaveText(["non-existent todo item"], {
                timeout: 2000,
            });
        });

        test("should fail - verify wrong item count", async ({ page }) => {
            const newTodo = page.getByPlaceholder("What needs to be done?");

            await newTodo.fill(TODO_ITEMS[0]);
            await newTodo.press("Enter");

            await page.screenshot({
                path: "test-results/screenshots/31-before-wrong-count-check.png",
                fullPage: true,
            });

            // This will fail - expecting 5 items but only 1 exists
            await expect(page.getByTestId("todo-item")).toHaveCount(5, { timeout: 2000 });
        });
    });
});
