import tkinter as tk
from tkinter import ttk, scrolledtext
import json
from typing import Dict, List
from ..docs.glossary import GlossaryService

class GlossaryInterface:
    def __init__(self, root=None):
        self.glossary_service = GlossaryService()
        
        # Create main window if not provided
        if root is None:
            self.root = tk.Tk()
            self.root.title("plAIgiarized - Writing Analysis Glossary")
            self.root.geometry("1000x800")
        else:
            self.root = root

        # Create main frame
        self.main_frame = ttk.Frame(self.root, padding="10")
        self.main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))

        # Style configuration
        style = ttk.Style()
        style.configure("Title.TLabel", font=("Arial", 16, "bold"))
        style.configure("Category.TLabel", font=("Arial", 12, "bold"))
        style.configure("Term.TLabel", font=("Arial", 10, "bold"))
        style.configure("Search.TEntry", font=("Arial", 10))

        self._create_search_bar()
        self._create_quick_index()
        self._create_content_area()
        self._populate_initial_content()

    def _create_search_bar(self):
        """Create search bar with real-time filtering."""
        search_frame = ttk.Frame(self.main_frame)
        search_frame.grid(row=0, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=(0, 10))

        # Search label
        ttk.Label(search_frame, text="Search Terms:", style="Term.TLabel").pack(side=tk.LEFT, padx=(0, 10))

        # Search entry
        self.search_var = tk.StringVar()
        self.search_entry = ttk.Entry(
            search_frame, 
            textvariable=self.search_var, 
            style="Search.TEntry",
            width=50
        )
        self.search_entry.pack(side=tk.LEFT, fill=tk.X, expand=True)
        
        # Bind search functionality
        self.search_var.trace("w", self._on_search_change)

        # Clear button
        ttk.Button(
            search_frame, 
            text="Clear", 
            command=self._clear_search
        ).pack(side=tk.LEFT, padx=(10, 0))

    def _create_quick_index(self):
        """Create quick index sidebar."""
        index_frame = ttk.Frame(self.main_frame, width=200)
        index_frame.grid(row=1, column=0, sticky=(tk.N, tk.S, tk.W), padx=(0, 10))
        
        # Index title
        ttk.Label(
            index_frame, 
            text="Quick Index", 
            style="Category.TLabel"
        ).pack(anchor=tk.W, pady=(0, 5))

        # Create category buttons
        self.category_buttons = {}
        for category in self.glossary_service.glossary.keys():
            btn = ttk.Button(
                index_frame,
                text=category,
                command=lambda c=category: self._show_category(c),
                width=25
            )
            btn.pack(anchor=tk.W, pady=2)
            self.category_buttons[category] = btn

    def _create_content_area(self):
        """Create main content area with term definitions."""
        content_frame = ttk.Frame(self.main_frame)
        content_frame.grid(row=1, column=1, sticky=(tk.N, tk.S, tk.E, tk.W))

        # Content title
        self.content_title = ttk.Label(
            content_frame,
            text="Writing Analysis Terms",
            style="Title.TLabel"
        )
        self.content_title.pack(anchor=tk.W, pady=(0, 10))

        # Scrollable content area
        self.content_text = scrolledtext.ScrolledText(
            content_frame,
            wrap=tk.WORD,
            width=60,
            height=30,
            font=("Arial", 10)
        )
        self.content_text.pack(fill=tk.BOTH, expand=True)
        self.content_text.config(state=tk.DISABLED)

    def _on_search_change(self, *args):
        """Handle search input changes."""
        search_text = self.search_var.get().strip().lower()
        if search_text:
            results = self.glossary_service.search_terms(search_text)
            self._display_search_results(results)
        else:
            self._populate_initial_content()

    def _clear_search(self):
        """Clear search and reset display."""
        self.search_var.set("")
        self._populate_initial_content()

    def _show_category(self, category: str):
        """Display terms for selected category."""
        self.content_title.config(text=category)
        terms = self.glossary_service.get_category(category)
        self._update_content_display(terms)

    def _display_search_results(self, results: Dict):
        """Display search results."""
        self.content_title.config(text="Search Results")
        self._update_content_display(results)

    def _update_content_display(self, content: Dict):
        """Update the content area with formatted text."""
        self.content_text.config(state=tk.NORMAL)
        self.content_text.delete(1.0, tk.END)

        for category, terms in content.items():
            # Add category header
            self.content_text.insert(tk.END, f"\n{category}\n", "category")
            self.content_text.insert(tk.END, "="*50 + "\n\n")

            # Add terms and definitions
            for term, details in terms.items():
                self.content_text.insert(tk.END, f"{term}\n", "term")
                self.content_text.insert(tk.END, f"Definition: {details['definition']}\n")
                self.content_text.insert(tk.END, f"Example: {details['example']}\n")
                self.content_text.insert(tk.END, f"How it's used: {details['how_its_used']}\n\n")

        self.content_text.config(state=tk.DISABLED)

    def _populate_initial_content(self):
        """Show initial content when interface opens."""
        first_category = next(iter(self.glossary_service.glossary))
        self._show_category(first_category)

    def _configure_tags(self):
        """Configure text display tags."""
        self.content_text.tag_configure("category", font=("Arial", 12, "bold"))
        self.content_text.tag_configure("term", font=("Arial", 10, "bold"))
        self.content_text.tag_configure("highlight", background="yellow")

    def run(self):
        """Start the glossary interface."""
        self._configure_tags()
        if isinstance(self.root, tk.Tk):
            self.root.mainloop()

    def destroy(self):
        """Clean up resources."""
        if isinstance(self.root, tk.Tk):
            self.root.destroy() 